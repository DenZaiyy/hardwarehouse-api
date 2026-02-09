import {NextRequest, NextResponse} from 'next/server';
import { ImageUploadService } from '@/services/image-upload.service';

interface RouteParams {
  params: Promise<{ slug: string; filename: string }>;
}

/**
 * DELETE /api/upload/products/[slug]/[filename]
 * Supprime une image spécifique d'un produit
 * 
 * Exemples:
 * - DELETE /api/upload/products/clavier-rgb/thumbnail
 * - DELETE /api/upload/products/clavier-rgb/image-2
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const { slug, filename } = await params;

    if (!slug || !filename) {
      return NextResponse.json(
        { success: false, error: 'Slug et filename requis', code: 'INVALID_TYPE' },
        { status: 400 }
      );
    }

    // Valider le format du filename
    const validFilenames = /^(thumbnail|image-\d+)$/;
    if (!validFilenames.test(filename)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Format de filename invalide. Attendu: thumbnail ou image-N', 
          code: 'INVALID_TYPE' 
        },
        { status: 400 }
      );
    }

    const result = await ImageUploadService.deleteImage('products', slug, filename);

    if (!result.success) {
      const status = result.code === 'NOT_FOUND' ? 404 : 500;
      return NextResponse.json(result, { status });
    }

    // Retourner aussi les URLs mises à jour des images restantes
    const remainingImages = await ImageUploadService.getUpdatedImageUrls('products', slug);

    return NextResponse.json({
      ...result,
      images: remainingImages,
    });
  } catch (error) {
    console.error('Erreur DELETE /api/upload/products/[slug]/[filename]:', error);
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
