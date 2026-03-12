import sharp from 'sharp';
import {access, mkdir, readdir, rm, unlink} from 'fs/promises';
import {join} from 'path';
import {
  DeleteResponse,
  LogoUploadData,
  ProductUploadData,
  ResponsiveImageSet,
  UploadConfig,
  UploadEntityType,
  UploadResponse
} from '@/types/types';

/**
 * Service d'upload d'images avec conversion WebP
 * HardWareHouse - Organisation: public/images/{entity}/{slug}/
 */
export class ImageUploadService {
  // ============================================================================
  // CONFIGURATION
  // ============================================================================
  
  private static readonly UPLOAD_CONFIG: UploadConfig = {
    maxSize: 5 * 1024 * 1024, // 5 MB
    allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
    quality: 80,
    dimensions: {
      thumbnail: 400,
      logo: 400,
      gallery: 1200,
    },
    // Configuration responsive multi-tailles
    responsiveSizes: {
      thumbnail: [
        { suffix: '', width: 400 }, // thumbnail.webp (400x400)
        { suffix: '@2x', width: 800 }, // thumbnail@2x.webp (800x800)
      ],
      logo: [
        { suffix: '', width: 400 }, // logo.webp (400x400)
        { suffix: '@2x', width: 800 }, // logo@2x.webp (800x800)
      ],
      gallery: [
        { suffix: '-sm', width: 600 }, // image-1-sm.webp (libre)
        { suffix: '', width: 1200 }, // image-1.webp (libre)
        { suffix: '-lg', width: 1920 }, // image-1-lg.webp (libre)
      ],
    },
  };

  private static readonly IMAGES_DIR = 'public/images';

  // ============================================================================
  // HELPERS DE CONFIGURATION
  // ============================================================================



  /**
   * Génère le chemin du dossier pour un type et slug donnés
   */
  private static getUploadDir(type: UploadEntityType, slug: string): string {
    return `${this.IMAGES_DIR}/${type}/${slug}`;
  }

  /**
   * Formate la taille en string lisible
   */
  private static formatFileSize(bytes: number): string {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(2)} MB`;
  }

  // ============================================================================
  // VALIDATION
  // ============================================================================

  /**
   * Valide un fichier (MIME type + taille)
   */
  private static validateFile(file: File): { valid: boolean; error?: string; code?: 'INVALID_MIME_TYPE' | 'FILE_TOO_LARGE' } {
    if (!this.UPLOAD_CONFIG.allowedMimeTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Type de fichier non autorisé: ${file.type}. Types acceptés: ${this.UPLOAD_CONFIG.allowedMimeTypes.join(', ')}`,
        code: 'INVALID_MIME_TYPE',
      };
    }

    if (file.size > this.UPLOAD_CONFIG.maxSize) {
      return {
        valid: false,
        error: `Fichier trop volumineux: ${this.formatFileSize(file.size)}. Maximum: ${this.formatFileSize(this.UPLOAD_CONFIG.maxSize)}`,
        code: 'FILE_TOO_LARGE',
      };
    }

    return { valid: true };
  }

  // ============================================================================
  // CONVERSION WEBP
  // ============================================================================

  /**
   * Convertit un fichier en WebP avec redimensionnement carré
   */
  private static async convertToWebp(file: File, options: { maxWidth: number; quality?: number; square?: boolean }): Promise<Buffer> {
    const { maxWidth, quality = this.UPLOAD_CONFIG.quality, square = true } = options;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let sharpInstance = sharp(buffer);

    if (square) {
      // Format carré : resize et crop au centre
      sharpInstance = sharpInstance
        .resize(maxWidth, maxWidth, {
          fit: 'cover', // Crop au centre pour garder l'aspect carré
          position: 'center'
        });
    } else {
      // Format libre : resize en gardant le ratio
      sharpInstance = sharpInstance
        .resize(maxWidth, null, {
          withoutEnlargement: true,
          fit: 'inside',
        });
    }

    return sharpInstance
      .webp({ quality })
      .toBuffer();
  }

  /**
   * Génère plusieurs tailles d'une image pour le responsive
   */
  private static async generateResponsiveImages(
    file: File, 
    directory: string, 
    baseFilename: string, 
    imageType: 'thumbnail' | 'logo' | 'gallery'
  ): Promise<ResponsiveImageSet> {
    const sizes = this.UPLOAD_CONFIG.responsiveSizes[imageType];
    const entityType = directory.includes('/products/') ? 'products' : 
                     directory.includes('/categories/') ? 'categories' : 'brands';
    const slug = directory.split('/').pop()!;
    
    let mainUrl = '';
    let fallbackUrl = ''; // URL de secours si la version principale est skippée
    const sizeUrls: { [suffix: string]: string } = {};

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Obtenir les dimensions originales de l'image
    const metadata = await sharp(buffer).metadata();
    const originalWidth = metadata.width || 1200;
    const originalHeight = metadata.height || 1200;

    console.log(`[UPLOAD] Processing ${baseFilename} - Original: ${originalWidth}x${originalHeight}`);

    // Pour éviter de générer des tailles identiques, on track la dernière largeur générée
    let lastGeneratedWidth = 0;

    for (const size of sizes) {
      const filename = `${baseFilename}${size.suffix}`;
      
      // Détermine si c'est un format carré (thumbnails et logos)
      const isSquare = imageType === 'thumbnail' || imageType === 'logo';
      
      let targetWidth: number;
      let sharpInstance = sharp(buffer);
      
      if (isSquare) {
        // Format carré : toujours générer à la taille exacte demandée
        targetWidth = size.width;
        sharpInstance = sharpInstance
          .resize(size.width, size.width, {
            fit: 'cover',
            position: 'center'
          });
      } else {
        // Format libre pour gallery : ne pas agrandir au-delà de l'original
        targetWidth = Math.min(size.width, originalWidth);

        // Skip si la taille serait identique à la précédente (sauf pour la version principale)
        if (targetWidth === lastGeneratedWidth && size.suffix !== '') {
          console.log(`[UPLOAD] Skipping ${filename} - same as previous (${targetWidth}px)`);
          continue;
        }

        // Si c'est la version principale mais qu'elle serait identique, on la génère quand même
        // car c'est elle qui est stockée en base
        if (targetWidth === lastGeneratedWidth && size.suffix === '') {
          console.log(`[UPLOAD] Generating ${filename} anyway (main version) - ${targetWidth}px`);
        }

        sharpInstance = sharpInstance
          .resize(targetWidth, null, {
            fit: 'inside',
          });
      }

      const resizedBuffer = await sharpInstance
        .webp({ quality: this.UPLOAD_CONFIG.quality })
        .toBuffer();

      // Obtenir les dimensions réelles après resize
      const resizedMetadata = await sharp(resizedBuffer).metadata();
      console.log(`[UPLOAD] Generated ${filename}: ${resizedMetadata.width}x${resizedMetadata.height}`);

      await this.ensureDirectory(directory);
      const filePath = join(directory, `${filename}.webp`);
      await sharp(resizedBuffer).toFile(filePath);

      const url = this.getImageUrl(entityType, slug, `${filename}.webp`);
      
      if (size.suffix === '') {
        mainUrl = url;
      } else {
        sizeUrls[size.suffix] = url;
        // Garder la première URL générée comme fallback
        if (!fallbackUrl) {
          fallbackUrl = url;
        }
      }

      lastGeneratedWidth = targetWidth;
    }

    // Si mainUrl est vide (version principale skippée), utiliser le fallback
    if (!mainUrl && fallbackUrl) {
      console.log(`[UPLOAD] Using fallback URL for ${baseFilename}: ${fallbackUrl}`);
      mainUrl = fallbackUrl;
    }

    return { main: mainUrl, sizes: sizeUrls };
  }

  // ============================================================================
  // GESTION DES FICHIERS
  // ============================================================================

  /**
   * Vérifie si un dossier existe
   */
  private static async directoryExists(path: string): Promise<boolean> {
    try {
      await access(path);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Crée le dossier de destination s'il n'existe pas
   */
  private static async ensureDirectory(path: string): Promise<void> {
    await mkdir(path, { recursive: true });
  }

  /**
   * Sauvegarde un buffer WebP dans un fichier
   */
  private static async saveWebpFile(buffer: Buffer, directory: string, filename: string): Promise<string> {
    await this.ensureDirectory(directory);
    
    const filePath = join(directory, `${filename}.webp`);
    await sharp(buffer).toFile(filePath);
    
    return filePath;
  }

  // ============================================================================
  // API PUBLIQUE - PARSING
  // ============================================================================

  /**
   * Parse le FormData pour les produits
   */
  static parseProductFormData(formData: FormData): ProductUploadData {
    const data: ProductUploadData = {};

    // Thumbnail
    const thumbnail = formData.get('thumbnail');
    if (thumbnail instanceof File && thumbnail.size > 0) {
      data.thumbnail = thumbnail;
    }

    // Images - support deux formats:
    // 1. images[0], images[1], etc. (format indexé)
    // 2. images, images, images (même clé répétée avec getAll)
    const images = new Map<number, File>();
    let imageIndex = 0;

    for (const [key, value] of formData.entries()) {
      // Format indexé: images[0], images[1], etc.
      const match = key.match(/^images\[(\d+)\]$/);
      if (match && value instanceof File && value.size > 0) {
        const index = parseInt(match[1], 10);
        images.set(index, value);
      }
      // Format simple: images (même clé répétée)
      else if (key === 'images' && value instanceof File && value.size > 0) {
        images.set(imageIndex, value);
        imageIndex++;
      }
    }

    if (images.size > 0) {
      data.images = images;
    }

    return data;
  }

  /**
   * Parse le FormData pour categories/brands
   */
  static parseLogoFormData(formData: FormData): LogoUploadData {
    const logo = formData.get('logo');
    
    if (logo instanceof File && logo.size > 0) {
      return { logo };
    }
    
    return {};
  }

  // ============================================================================
  // API PUBLIQUE - UPLOAD PRODUCTS
  // ============================================================================

  /**
   * Upload les images d'un produit
   */
  static async uploadProductImages(slug: string, data: ProductUploadData): Promise<UploadResponse> {
    const directory = this.getUploadDir('products', slug);
    const result: {
      thumbnail?: string;
      thumbnailSet?: ResponsiveImageSet;
      images: string[];
      imageSets?: ResponsiveImageSet[]
    } = { images: [] };

    try {
      // Valider tous les fichiers d'abord
      if (data.thumbnail) {
        const validation = this.validateFile(data.thumbnail);
        if (!validation.valid) {
          return { success: false, error: validation.error!, code: validation.code! };
        }
      }

      if (data.images) {
        for (const [index, file] of data.images) {
          const validation = this.validateFile(file);
          if (!validation.valid) {
            return { 
              success: false, 
              error: `Image ${index + 1}: ${validation.error}`, 
              code: validation.code! 
            };
          }
        }
      }

      // Traiter le thumbnail avec versions responsives
      if (data.thumbnail) {
        const imageSet = await this.generateResponsiveImages(
          data.thumbnail,
          directory,
          'thumbnail',
          'thumbnail'
        );
        result.thumbnail = imageSet.main; // URL principale
        result.thumbnailSet = imageSet; // Toutes les tailles
      }

      // Traiter les images de galerie
      if (data.images) {
        // Récupérer les images existantes pour merge
        const existingImages = await this.getExistingGalleryImages('products', slug);
        
        for (const [index, file] of data.images) {
          const baseFilename = `image-${index + 1}`;
          const imageSet = await this.generateResponsiveImages(
            file,
            directory,
            baseFilename,
            'gallery'
          );
          existingImages[index] = imageSet.main; // URL principale
        }

        // Filtrer les undefined et retourner le tableau
        result.images = existingImages.filter((img): img is string => img !== undefined);
      }

      return {
        success: true,
        ...(result.thumbnail && { thumbnail: result.thumbnail }),
        ...(result.images.length > 0 && { images: result.images }),
      };
    } catch (error) {
      console.error('Erreur upload produit:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur lors du traitement des images',
        code: 'PROCESSING_ERROR',
      };
    }
  }

  /**
   * Récupère les URLs des images existantes d'un produit
   */
  private static async getExistingGalleryImages(type: UploadEntityType, slug: string): Promise<(string | undefined)[]> {
    const directory = this.getUploadDir(type, slug);
    const images: (string | undefined)[] = [];

    try {
      if (!(await this.directoryExists(directory))) {
        return images;
      }

      const files = await readdir(directory);
      
      for (const file of files) {
        const match = file.match(/^image-(\d+)\.webp$/);
        if (match) {
          const index = parseInt(match[1], 10) - 1;
          images[index] = ImageUploadService.getImageUrl(type, slug, file);
        }
      }
    } catch {
      // Dossier n'existe pas encore
    }

    return images;
  }

  // ============================================================================
  // API PUBLIQUE - UPLOAD LOGOS
  // ============================================================================

  /**
   * Upload le logo d'une catégorie ou marque
   */
  static async uploadLogo(
    type: 'categories' | 'brands',
    slug: string,
    data: LogoUploadData
  ): Promise<UploadResponse> {
    if (!data.logo) {
      return { success: true };
    }

    try {
      // Valider
      const validation = this.validateFile(data.logo);
      if (!validation.valid) {
        return { success: false, error: validation.error!, code: validation.code! };
      }

      // Convertir et sauvegarder avec versions responsives
      const directory = this.getUploadDir(type, slug);
      const imageSet = await this.generateResponsiveImages(
        data.logo,
        directory,
        'logo',
        'logo'
      );

      return {
        success: true,
        logo: imageSet.main, // URL principale
        logoSet: imageSet, // Toutes les tailles
      };
    } catch (error) {
      console.error(`Erreur upload logo ${type}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur lors du traitement du logo',
        code: 'PROCESSING_ERROR',
      };
    }
  }

  // ============================================================================
  // API PUBLIQUE - SUPPRESSION
  // ============================================================================

  /**
   * Supprime tout le dossier d'un élément (produit/catégorie/marque)
   */
  static async deleteAllImages(type: UploadEntityType, slug: string): Promise<DeleteResponse> {
    const directory = this.getUploadDir(type, slug);

    try {
      if (!(await this.directoryExists(directory))) {
        return { success: false, error: 'Dossier non trouvé', code: 'NOT_FOUND' };
      }

      const files = await readdir(directory);
      await rm(directory, { recursive: true, force: true });

      return {
        success: true,
        deleted: files,
      };
    } catch (error) {
      console.error(`Erreur suppression ${type}/${slug}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur lors de la suppression',
        code: 'DELETE_ERROR',
      };
    }
  }

  /**
   * Supprime une image spécifique
   */
  static async deleteImage(
    type: UploadEntityType,
    slug: string,
    filename: string
  ): Promise<DeleteResponse> {
    const directory = this.getUploadDir(type, slug);
    const filePath = join(directory, `${filename}.webp`);

    try {
      await access(filePath);
      await unlink(filePath);

      // Vérifier si le dossier est vide et le supprimer si c'est le cas
      const remainingFiles = await readdir(directory);
      if (remainingFiles.length === 0) {
        await rm(directory, { recursive: true, force: true });
      }

      return {
        success: true,
        deleted: [`${filename}.webp`],
      };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return { success: false, error: 'Fichier non trouvé', code: 'NOT_FOUND' };
      }
      
      console.error(`Erreur suppression ${type}/${slug}/${filename}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur lors de la suppression',
        code: 'DELETE_ERROR',
      };
    }
  }

  /**
   * Supprime toutes les images de galerie d'un produit (image-*.webp)
   * Garde le thumbnail intact
   */
  static async deleteGalleryImages(type: UploadEntityType, slug: string): Promise<void> {
    const directory = this.getUploadDir(type, slug);

    try {
      if (!(await this.directoryExists(directory))) {
        return;
      }

      const files = await readdir(directory);

      // Supprimer uniquement les fichiers image-* (pas le thumbnail)
      for (const file of files) {
        if (file.match(/^image-\d+(-sm|-lg)?\.webp$/)) {
          const filePath = join(directory, file);
          await unlink(filePath);
          console.log(`[DELETE] Removed gallery image: ${file}`);
        }
      }
    } catch (error) {
      console.error(`Erreur suppression galerie ${type}/${slug}:`, error);
    }
  }

  /**
   * Supprime le thumbnail d'un produit (thumbnail*.webp)
   * Garde les images de galerie intactes
   */
  static async deleteThumbnail(type: UploadEntityType, slug: string): Promise<void> {
    const directory = this.getUploadDir(type, slug);

    try {
      if (!(await this.directoryExists(directory))) {
        return;
      }

      const files = await readdir(directory);

      // Supprimer uniquement les fichiers thumbnail* (pas les images de galerie)
      for (const file of files) {
        if (file.match(/^thumbnail(@2x)?\.webp$/)) {
          const filePath = join(directory, file);
          await unlink(filePath);
          console.log(`[DELETE] Removed thumbnail: ${file}`);
        }
      }
    } catch (error) {
      console.error(`Erreur suppression thumbnail ${type}/${slug}:`, error);
    }
  }

  /**
   * Met à jour le tableau d'images après suppression (pour réindexer si nécessaire)
   */
  static async getUpdatedImageUrls(type: UploadEntityType, slug: string): Promise<string[]> {
    const directory = this.getUploadDir(type, slug);
    const images: string[] = [];

    try {
      if (!(await this.directoryExists(directory))) {
        return images;
      }

      const files = await readdir(directory);
      
      // Trier les fichiers image par numéro
      const imageFiles = files
        .filter(f => f.match(/^image-\d+\.webp$/))
        .sort((a, b) => {
          const numA = parseInt(a.match(/^image-(\d+)\.webp$/)?.[1] || '0', 10);
          const numB = parseInt(b.match(/^image-(\d+)\.webp$/)?.[1] || '0', 10);
          return numA - numB;
        });

      for (const file of imageFiles) {
        images.push(ImageUploadService.getImageUrl(type, slug, file));
      }
    } catch {
      // Dossier n'existe pas
    }

    return images;
  }

  // ============================================================================
  // API PUBLIQUE - UTILITAIRES
  // ============================================================================

  /**
   * Obtenir la configuration d'upload
   */
  static getConfig(): UploadConfig {
    return { ...this.UPLOAD_CONFIG };
  }

  /**
   * Obtenir l'URL relative d'une image
   */
  static getImageUrl(type: UploadEntityType, slug: string, filename: string): string {
    return `/images/${type}/${slug}/${filename}`;
  }

  /**
   * Obtenir toutes les URLs responsive d'une image
   */
  static async getResponsiveImageUrls(
    type: UploadEntityType, 
    slug: string, 
    baseFilename: string,
    imageType: 'thumbnail' | 'logo' | 'gallery'
  ): Promise<ResponsiveImageSet | null> {
    const directory = this.getUploadDir(type, slug);
    const sizes = this.UPLOAD_CONFIG.responsiveSizes[imageType];
    
    try {
      if (!(await this.directoryExists(directory))) {
        return null;
      }

      const files = await readdir(directory);
      let mainUrl = '';
      const sizeUrls: { [suffix: string]: string } = {};
      
      for (const size of sizes) {
        const filename = `${baseFilename}${size.suffix}.webp`;
        
        if (files.includes(filename)) {
          const url = this.getImageUrl(type, slug, filename);
          
          if (size.suffix === '') {
            mainUrl = url;
          } else {
            sizeUrls[size.suffix] = url;
          }
        }
      }

      return mainUrl ? { main: mainUrl, sizes: sizeUrls } : null;
      
    } catch {
      return null;
    }
  }

  /**
   * Obtenir l'ensemble responsive d'un thumbnail
   */
  static async getThumbnailResponsiveUrls(type: UploadEntityType, slug: string): Promise<ResponsiveImageSet | null> {
    return this.getResponsiveImageUrls(type, slug, 'thumbnail', 'thumbnail');
  }

  /**
   * Obtenir l'ensemble responsive d'un logo
   */
  static async getLogoResponsiveUrls(type: 'categories' | 'brands', slug: string): Promise<ResponsiveImageSet | null> {
    return this.getResponsiveImageUrls(type, slug, 'logo', 'logo');
  }

  /**
   * Obtenir tous les ensembles responsives des images de galerie
   */
  static async getGalleryResponsiveUrls(slug: string): Promise<ResponsiveImageSet[]> {
    const directory = this.getUploadDir('products', slug);
    const imageSets: ResponsiveImageSet[] = [];
    
    try {
      if (!(await this.directoryExists(directory))) {
        return imageSets;
      }

      const files = await readdir(directory);
      const imageIndexes = new Set<number>();
      
      // Identifier tous les index d'images présents
      for (const file of files) {
        const match = file.match(/^image-(\d+)(?:-\w+)?\.webp$/);
        if (match) {
          imageIndexes.add(parseInt(match[1], 10));
        }
      }
      
      // Pour chaque index, créer l'ensemble responsive
      for (const index of Array.from(imageIndexes).sort((a, b) => a - b)) {
        const imageSet = await this.getResponsiveImageUrls('products', slug, `image-${index}`, 'gallery');
        if (imageSet) {
          imageSets.push(imageSet);
        }
      }
      
    } catch {
      // Dossier n'existe pas
    }
    
    return imageSets;
  }
}