import {NextRequest, NextResponse} from 'next/server';
import { ImageUploadService } from '@/services/image-upload.service';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

/**
 * POST /api/upload/products/[slug]
 * Upload thumbnail et/ou images de galerie pour un produit
 * 
 * FormData:
 * - thumbnail?: File
 * - images[0]?: File
 * - images[1]?: File
 * - ...
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

    const formData = await request.formData();
    const data = ImageUploadService.parseProductFormData(formData);

    // Vérifier qu'il y a au moins un fichier
    if (!data.thumbnail && !data.images) {
      return NextResponse.json(
        { success: false, error: 'Aucun fichier envoyé', code: 'INVALID_TYPE' },
        { status: 400 }
      );
    }

    const result = await ImageUploadService.uploadProductImages(slug, data);

    if (!result.success) {
      const status = result.code === 'INVALID_MIME_TYPE' || result.code === 'FILE_TOO_LARGE' 
        ? 400 
        : 500;
      return NextResponse.json(result, { status });
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
 * Supprime toutes les images d'un produit
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

    const result = await ImageUploadService.deleteAllImages('products', slug);

    if (!result.success) {
      const status = result.code === 'NOT_FOUND' ? 404 : 500;
      return NextResponse.json(result, { status });
    }

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
