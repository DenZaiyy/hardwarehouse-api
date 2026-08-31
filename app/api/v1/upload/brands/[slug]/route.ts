import {NextRequest, NextResponse} from 'next/server';
import {ImageUploadService} from '@/services/image-upload.service';
import {db} from '@/lib/db';
import {requireAuth} from '@/lib/auth/require-role';
import {isSafeSlug, rateLimiter} from '@/lib/utils';

interface RouteParams {
  params: Promise<{ slug: string }>;
}

/**
 * POST /api/upload/brands/[slug]
 * Upload le logo d'une marque et met à jour la marque en DB
 *
 * FormData:
 * - logo: File
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  const { response } = await requireAuth();
  if (response) return response;

  try {
    const { slug } = await params;

    if (!slug || !isSafeSlug(slug)) {
      return NextResponse.json(
        { success: false, error: 'Slug requis', code: 'INVALID_TYPE' },
        { status: 400 }
      );
    }

    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
    const { success: withinLimit } = await rateLimiter.limit(ip);
    if (!withinLimit) {
      return NextResponse.json({ success: false, error: 'Trop de demandes', code: 'RATE_LIMITED' }, { status: 429 });
    }

    // Vérifier que la marque existe
    const brand = await db.brands.findUnique({
      where: { slug },
      select: { id: true }
    });

    if (!brand) {
      return NextResponse.json(
        { success: false, error: 'Marque introuvable', code: 'NOT_FOUND' },
        { status: 404 }
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

    // Mettre à jour la marque avec l'URL du logo
    if (result.logo) {
      await db.brands.update({
        where: { slug },
        data: { logo: result.logo }
      });
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
 * Supprime le logo d'une marque et met à jour la marque en DB
 */
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  const { response } = await requireAuth();
  if (response) return response;

  try {
    const { slug } = await params;

    if (!slug || !isSafeSlug(slug)) {
      return NextResponse.json(
        { success: false, error: 'Slug requis', code: 'INVALID_TYPE' },
        { status: 400 }
      );
    }

    // Vérifier que la marque existe
    const brand = await db.brands.findUnique({
      where: { slug },
      select: { id: true }
    });

    if (!brand) {
      return NextResponse.json(
        { success: false, error: 'Marque introuvable', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    const result = await ImageUploadService.deleteAllImages('brands', slug);

    if (!result.success) {
      const status = result.code === 'NOT_FOUND' ? 404 : 500;
      return NextResponse.json(result, { status });
    }

    // Supprimer le logo de la marque en DB
    await db.brands.update({
      where: { slug },
      data: { logo: null }
    });

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
