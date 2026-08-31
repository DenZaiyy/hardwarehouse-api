import {NextRequest, NextResponse} from 'next/server';
import {ImageUploadService} from '@/services/image-upload.service';
import {db} from '@/lib/db';
import {requireAuth} from '@/lib/auth/require-role';
import {isSafeSlug} from '@/lib/utils';

interface RouteParams {
  params: Promise<{ slug: string; filename: string }>;
}

/**
 * DELETE /api/upload/products/[slug]/[filename]
 * Supprime une image spécifique d'un produit et met à jour le produit en DB
 *
 * Exemples:
 * - DELETE /api/upload/products/clavier-rgb/thumbnail
 * - DELETE /api/upload/products/clavier-rgb/image-2
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { response } = await requireAuth();
  if (response) return response;

  try {
    const { slug, filename } = await params;

    if (!slug || !filename || !isSafeSlug(slug)) {
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

    // Vérifier que le produit existe
    const product = await db.products.findUnique({
      where: { slug },
      select: { id: true, thumbnail: true, images: true }
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Produit introuvable', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const result = await ImageUploadService.deleteImage('products', slug, filename);

    if (!result.success) {
      const status = result.code === 'NOT_FOUND' ? 404 : 500;
      return NextResponse.json(result, { status });
    }

    // Mettre à jour le produit en DB
    if (filename === 'thumbnail') {
      // Supprimer le thumbnail
      await db.products.update({
        where: { slug },
        data: { thumbnail: null }
      });
    } else {
      // Supprimer l'image de la galerie par son index
      const imageIndex = parseInt(filename.replace('image-', ''));
      const currentImages = product.images || [];
      const updatedImages = currentImages.filter((_, index) => index !== imageIndex);

      await db.products.update({
        where: { slug },
        data: { images: updatedImages }
      });
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
