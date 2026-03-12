import {NextRequest, NextResponse} from 'next/server';
import {ImageUploadService} from '@/services/image-upload.service';
import {db} from '@/lib/db';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

/**
 * POST /api/upload/categories/[slug]
 * Upload le logo d'une catégorie et met à jour la catégorie en DB
 *
 * FormData:
 * - logo: File
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

    // Vérifier que la catégorie existe
    const category = await db.categories.findUnique({
      where: { slug },
      select: { id: true }
    });

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Catégorie introuvable', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const formData = await request.formData();
    const data = ImageUploadService.parseLogoFormData(formData);

    if (!data.logo) {
      return NextResponse.json(
        { success: false, error: 'Aucun fichier logo envoyé', code: 'INVALID_TYPE' },
        { status: 400 }
      );
    }

    const result = await ImageUploadService.uploadLogo('categories', slug, data);

    if (!result.success) {
      const status = result.code === 'INVALID_MIME_TYPE' || result.code === 'FILE_TOO_LARGE' 
        ? 400 
        : 500;
      return NextResponse.json(result, { status });
    }

    // Mettre à jour la catégorie avec l'URL du logo
    if (result.logo) {
      await db.categories.update({
        where: { slug },
        data: { logo: result.logo }
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erreur POST /api/upload/categories/[slug]:', error);
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
 * DELETE /api/upload/categories/[slug]
 * Supprime le logo d'une catégorie et met à jour la catégorie en DB
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

    // Vérifier que la catégorie existe
    const category = await db.categories.findUnique({
      where: { slug },
      select: { id: true }
    });

    if (!category) {
      return NextResponse.json(
        { success: false, error: 'Catégorie introuvable', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const result = await ImageUploadService.deleteAllImages('categories', slug);

    if (!result.success) {
      const status = result.code === 'NOT_FOUND' ? 404 : 500;
      return NextResponse.json(result, { status });
    }

    // Supprimer le logo de la catégorie en DB
    await db.categories.update({
      where: { slug },
      data: { logo: null }
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erreur DELETE /api/upload/categories/[slug]:', error);
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
