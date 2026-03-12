import {NextRequest, NextResponse} from 'next/server';
import {ImageUploadService} from '@/services/image-upload.service';
import {db} from '@/lib/db';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

/**
 * POST /api/upload/products/[slug]
 * Upload thumbnail et/ou images de galerie pour un produit
 * Met à jour automatiquement le produit en DB avec les URLs des images
 * REMPLACE les images existantes (ne fusionne pas)
 *
 * FormData:
 * - thumbnail?: File
 * - images?: File[] (remplace toutes les images de galerie existantes)
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Slug requis', code: 'INVALID_TYPE' },
        { status: 400 }
      );
    }

    // Vérifier que le produit existe
    const product = await db.products.findUnique({
      where: { slug },
      select: { id: true, images: true, thumbnail: true }
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Produit introuvable', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    const data = ImageUploadService.parseProductFormData(formData);

    // Vérifier qu'il y a au moins un fichier
    if (!data.thumbnail && !data.images) {
      return NextResponse.json(
        { success: false, error: 'Aucun fichier envoyé', code: 'INVALID_TYPE' },
        { status: 400 }
      );
    }

    // Supprimer les anciennes images avant d'uploader les nouvelles
    if (data.images && data.images.size > 0) {
      // Supprimer les anciennes images de galerie du disque
      await ImageUploadService.deleteGalleryImages('products', slug);
      console.log(`[UPLOAD] Deleted old gallery images for product: ${slug}`);
    }

    if (data.thumbnail) {
      // Supprimer l'ancien thumbnail du disque
      await ImageUploadService.deleteThumbnail('products', slug);
      console.log(`[UPLOAD] Deleted old thumbnail for product: ${slug}`);
    }

    const result = await ImageUploadService.uploadProductImages(slug, data);

    if (!result.success) {
      const status = result.code === 'INVALID_MIME_TYPE' || result.code === 'FILE_TOO_LARGE' 
        ? 400 
        : 500;
      return NextResponse.json(result, { status });
    }

    // Mettre à jour le produit avec les nouvelles URLs (remplace, ne fusionne pas)
    const updateData: { thumbnail?: string; images?: string[] } = {};

    if (result.thumbnail) {
      updateData.thumbnail = result.thumbnail;
    }

    if (result.images && result.images.length > 0) {
      // Remplacer les images existantes par les nouvelles
      updateData.images = result.images;
    }

    if (Object.keys(updateData).length > 0) {
      await db.products.update({
        where: { slug },
        data: updateData
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erreur POST /api/upload/products/[slug]:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur serveur lors de l\'upload', 
        code: 'PROCESSING_ERROR' 
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/upload/products/[slug]
 * Supprime toutes les images d'un produit et met à jour le produit en DB
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Slug requis', code: 'INVALID_TYPE' },
        { status: 400 }
      );
    }

    // Vérifier que le produit existe
    const product = await db.products.findUnique({
      where: { slug },
      select: { id: true }
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Produit introuvable', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const result = await ImageUploadService.deleteAllImages('products', slug);

    if (!result.success) {
      const status = result.code === 'NOT_FOUND' ? 404 : 500;
      return NextResponse.json(result, { status });
    }

    // Supprimer les URLs d'images du produit en DB
    await db.products.update({
      where: { slug },
      data: {
        thumbnail: null,
        images: []
      }
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erreur DELETE /api/upload/products/[slug]:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erreur serveur lors de la suppression', 
        code: 'DELETE_ERROR' 
      },
      { status: 500 }
    );
  }
}
