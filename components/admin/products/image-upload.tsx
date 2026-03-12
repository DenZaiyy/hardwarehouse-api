"use client"

import React, {useCallback, useState} from 'react';
import Image from 'next/image';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Card, CardContent} from '@/components/ui/card';
import {ImageIcon, Upload, X} from 'lucide-react';

type UploadMode = 'product' | 'logo';

interface ImageUploadProps {
  mode: UploadMode;
  // Props pour mode product
  onThumbnailChange?: (file: File | null) => void;
  onImagesChange?: (files: File[]) => void;
  thumbnailPreview?: string | null;
  imagesPreview?: string[]; // Images de galerie existantes
  maxImages?: number;
  // Props pour mode logo
  onLogoChange?: (file: File | null) => void;
  logoPreview?: string | null;
}

interface ImagePreviewProps {
  src: string;
  alt: string;
  onRemove: () => void;
  type: 'logo' | 'thumbnail' | 'gallery';
  showChangeButton?: boolean;
  inputId?: string;
}

// Composant d'aperçu unifié selon le type
const ImagePreview: React.FC<ImagePreviewProps> = ({ 
  src, 
  alt, 
  onRemove, 
  type, 
  showChangeButton = false, 
  inputId 
}) => {
  const getDimensions = () => {
    switch (type) {
      case 'logo':
      case 'thumbnail':
        return 'w-40 h-40'; // Format carré pour logos et thumbnails
      case 'gallery':
        return 'w-full h-24'; // Format libre pour gallery
      default:
        return 'w-40 h-40';
    }
  };

  const getContainerClass = () => {
    return type === 'gallery' ? 'relative' : 'relative mx-auto';
  };

  const getImageClass = () => {
    return type === 'logo' || type === 'thumbnail' 
      ? 'object-cover rounded-lg' // Crop pour format carré
      : 'object-cover rounded'; // Format libre pour gallery
  };

  const getRemoveButtonClass = () => {
    return type === 'gallery' 
      ? 'absolute -top-1 -right-1 h-6 w-6 rounded-full p-0'
      : 'absolute -top-2 -right-2 h-8 w-8 rounded-full p-0';
  };

  const getRemoveIconClass = () => {
    return type === 'gallery' ? 'h-3 w-3' : 'h-4 w-4';
  };

  return (
    <Card className={type === 'gallery' ? '' : ''}>
      <CardContent className={type === 'gallery' ? 'p-2' : 'p-4'}>
        <div className="relative">
          <div className={`relative ${getDimensions()} ${getContainerClass()}`}>
            <Image 
              src={src} 
              alt={alt} 
              fill 
              className={getImageClass()}
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            className={getRemoveButtonClass()}
            onClick={onRemove}
          >
            <X className={getRemoveIconClass()} />
          </Button>
        </div>
        {showChangeButton && inputId && (
          <div className="mt-3 text-center">
            <Label htmlFor={inputId} className="cursor-pointer">
              <Button type="button" variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                {type === 'logo' ? 'Changer le logo' : 'Changer l\'image'}
              </Button>
            </Label>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// Composant d'upload unifié selon le type
interface EmptyUploadProps {
  type: 'logo' | 'thumbnail' | 'gallery';
  inputId: string;
  remainingSlots?: number;
  maxImages?: number;
}

const EmptyUpload: React.FC<EmptyUploadProps> = ({ 
  type, 
  inputId, 
  remainingSlots, 
  maxImages 
}) => {
  const getContent = () => {
    switch (type) {
      case 'logo':
        return {
          icon: <ImageIcon className="h-12 w-12 text-muted-foreground" />,
          title: 'Cliquez pour sélectionner un logo',
          subtitle: 'PNG, JPG, WebP jusqu\'à 5MB'
        };
      case 'thumbnail':
        return {
          icon: <ImageIcon className="h-12 w-12 text-muted-foreground" />,
          title: 'Cliquez pour sélectionner une image',
          subtitle: 'PNG, JPG, WebP jusqu\'à 5MB'
        };
      case 'gallery':
        return {
          icon: <Upload className="h-8 w-8 text-muted-foreground" />,
          title: 'Ajouter des images',
          subtitle: `Sélectionnez plusieurs images (max ${remainingSlots} restantes)`
        };
      default:
        return {
          icon: <ImageIcon className="h-12 w-12 text-muted-foreground" />,
          title: 'Sélectionner des images',
          subtitle: 'PNG, JPG, WebP jusqu\'à 5MB'
        };
    }
  };

  const { icon, title, subtitle } = getContent();
  const padding = type === 'gallery' ? 'p-6' : 'p-8';

  return (
    <Label htmlFor={inputId} className="cursor-pointer">
      <Card className="border-dashed border-2 hover:border-primary/50 transition-colors w-full">
        <CardContent className={padding}>
          <div className="flex flex-col items-center justify-center text-center space-y-3">
            {icon}
            <div>
              <p className="font-medium">{title}</p>
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Label>
  );
};

const ImageUpload: React.FC<ImageUploadProps> = ({
  mode,
  onThumbnailChange,
  onImagesChange,
  thumbnailPreview,
  imagesPreview,
  maxImages = 5,
  onLogoChange,
  logoPreview
}) => {
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string | null>(thumbnailPreview || null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(logoPreview || null);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>(imagesPreview || []);

  const handleThumbnailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner un fichier image');
        return;
      }
      
      // Validate file size (max 5MB per file for better upload experience)
      if (file.size > 5 * 1024 * 1024) {
        alert('Le fichier ne doit pas dépasser 5MB');
        return;
      }

      setThumbnailFile(file);
      onThumbnailChange?.(file);
      
      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setThumbnailPreviewUrl(previewUrl);
    } else {
      setThumbnailFile(null);
      onThumbnailChange?.(null);
      setThumbnailPreviewUrl(null);
    }
  }, [onThumbnailChange]);

  const handleLogoChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Veuillez sélectionner un fichier image');
        return;
      }
      
      // Validate file size (max 5MB per file for better upload experience)
      if (file.size > 5 * 1024 * 1024) {
        alert('Le fichier ne doit pas dépasser 5MB');
        return;
      }

      setLogoFile(file);
      onLogoChange?.(file);
      
      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setLogoPreviewUrl(previewUrl);
    } else {
      setLogoFile(null);
      onLogoChange?.(null);
      setLogoPreviewUrl(null);
    }
  }, [onLogoChange]);

  const handleImagesChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate files
    const validFiles: File[] = [];
    const newPreviews: string[] = [];
    
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        alert(`${file.name} n'est pas un fichier image`);
        continue;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        alert(`${file.name} ne doit pas dépasser 5MB`);
        continue;
      }
      
      validFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    }
    
    // Limit number of images
    const totalImages = imageFiles.length + validFiles.length;
    if (totalImages > maxImages) {
      alert(`Maximum ${maxImages} images autorisées`);
      return;
    }
    
    const updatedFiles = [...imageFiles, ...validFiles];
    const updatedPreviews = [...imagePreviews, ...newPreviews];
    
    setImageFiles(updatedFiles);
    setImagePreviews(updatedPreviews);
    onImagesChange?.(updatedFiles);
  }, [imageFiles, imagePreviews, maxImages, onImagesChange]);

  const removeImage = useCallback((index: number) => {
    const updatedFiles = imageFiles.filter((_, i) => i !== index);
    const updatedPreviews = imagePreviews.filter((_, i) => i !== index);
    
    // Revoke URL to prevent memory leak
    URL.revokeObjectURL(imagePreviews[index]);
    
    setImageFiles(updatedFiles);
    setImagePreviews(updatedPreviews);
    onImagesChange?.(updatedFiles);
  }, [imageFiles, imagePreviews, onImagesChange]);

  const removeExistingImage = useCallback((index: number) => {
    const updatedExisting = existingImages.filter((_, i) => i !== index);
    setExistingImages(updatedExisting);
  }, [existingImages]);

  const removeThumbnail = useCallback(() => {
    if (thumbnailPreviewUrl) {
      URL.revokeObjectURL(thumbnailPreviewUrl);
    }
    setThumbnailFile(null);
    setThumbnailPreviewUrl(null);
    onThumbnailChange?.(null);
  }, [thumbnailPreviewUrl, onThumbnailChange]);

  const removeLogo = useCallback(() => {
    if (logoPreviewUrl) {
      URL.revokeObjectURL(logoPreviewUrl);
    }
    setLogoFile(null);
    setLogoPreviewUrl(null);
    onLogoChange?.(null);
  }, [logoPreviewUrl, onLogoChange]);

  // Mode logo : affichage simplifié
  if (mode === 'logo') {
    return (
      <div className="space-y-4">
        <Label className="text-base font-medium">Logo</Label>
        
        {logoPreviewUrl ? (
          <ImagePreview 
            src={logoPreviewUrl}
            alt="Aperçu logo"
            onRemove={removeLogo}
            type="logo"
            showChangeButton={true}
            inputId="logo-upload"
          />
        ) : (
          <EmptyUpload 
            type="logo"
            inputId="logo-upload"
          />
        )}
        
        <Input
          id="logo-upload"
          type="file"
          accept="image/*"
          onChange={handleLogoChange}
          className="hidden"
        />
      </div>
    );
  }

  // Mode product : affichage complet
  return (
    <div className="space-y-6">
      {/* Thumbnail Upload */}
      <div className="space-y-4">
        <Label className="text-base font-medium">Image principale (Thumbnail)</Label>
        
        {thumbnailPreviewUrl ? (
          <ImagePreview 
            src={thumbnailPreviewUrl}
            alt="Aperçu thumbnail"
            onRemove={removeThumbnail}
            type="thumbnail"
            showChangeButton={true}
            inputId="thumbnail-upload"
          />
        ) : (
          <EmptyUpload 
            type="thumbnail"
            inputId="thumbnail-upload"
          />
        )}
        
        <Input
          id="thumbnail-upload"
          type="file"
          accept="image/*"
          onChange={handleThumbnailChange}
          className="hidden"
        />
      </div>

      {/* Gallery Upload */}
      <div className="space-y-4">
        <Label className="text-base font-medium">
          Galerie d&#39;images ({existingImages.length + imageFiles.length}/{maxImages})
        </Label>
        
        {/* Images existantes (déjà uploadées en base) */}
        {existingImages.length > 0 && (
          <div>
            <p className="text-sm text-muted-foreground mb-2">Images actuelles :</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {existingImages.map((imageUrl, index) => (
                <ImagePreview
                  key={`existing-${index}`}
                  src={imageUrl}
                  alt={`Image existante ${index + 1}`}
                  onRemove={() => removeExistingImage(index)}
                  type="gallery"
                />
              ))}
            </div>
          </div>
        )}

        {/* Nouvelles images (uploadées dans ce formulaire) */}
        {imagePreviews.length > 0 && (
          <div>
            <p className="text-sm text-muted-foreground mb-2">Nouvelles images :</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {imagePreviews.map((preview, index) => (
                <ImagePreview
                  key={`new-${index}`}
                  src={preview}
                  alt={`Nouvelle image ${index + 1}`}
                  onRemove={() => removeImage(index)}
                  type="gallery"
                />
              ))}
            </div>
          </div>
        )}
        
        {(existingImages.length + imageFiles.length) < maxImages && (
          <EmptyUpload
            type="gallery"
            inputId="images-upload"
            remainingSlots={maxImages - existingImages.length - imageFiles.length}
            maxImages={maxImages}
          />
        )}
        
        <Input
          id="images-upload"
          type="file"
          accept="image/*"
          multiple
          onChange={handleImagesChange}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default ImageUpload;