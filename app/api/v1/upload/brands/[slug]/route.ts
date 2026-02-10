import {NextRequest, NextResponse} from 'next/server';
import { ImageUploadService } from '@/services/image-upload.service';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

/**
 * POST /api/upload/brands/[slug]
 * Upload le logo d'une marque
 * 
 * FormData:
 * - logo: File
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { success: false, error: 'Slug requis', code: 'INVALID_TYPE' },
        { status: 400 }
      );
    }

    const formData = await req.formData();
    const data = ImageUploadService.parseLogoFormData(formData);

    if (!data.logo) {
      return NextResponse.json(
        { success: false, error: 'Aucun fichier logo envoyé', code: 'INVALID_TYPE' },
        { status: 400 }
      );
    }

    const result = await ImageUploadService.uploadLogo('brands', slug, data);

    if (!result.success) {
      const status = result.code === 'INVALID_MIME_TYPE' || result.code === 'FILE_TOO_LARGE' 
        ? 400 
        : 500;
      return NextResponse.json(result, { status });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erreur POST /api/upload/brands/[slug]:', error);
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
 * DELETE /api/upload/brands/[slug]
 * Supprime le logo d'une marque
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

    const result = await ImageUploadService.deleteAllImages('brands', slug);

    if (!result.success) {
      const status = result.code === 'NOT_FOUND' ? 404 : 500;
      return NextResponse.json(result, { status });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erreur DELETE /api/upload/brands/[slug]:', error);
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
