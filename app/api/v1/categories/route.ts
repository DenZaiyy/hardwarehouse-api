import {NextRequest, NextResponse} from "next/server";
import {db} from "@/lib/db";
import {rateLimiter, slugifyName} from "@/lib/utils";
import {auth} from "@clerk/nextjs/server";
import {ImageUploadService} from "@/services/image-upload.service";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_req: NextRequest) {
    try {
        const categories = await db.categories.findMany({
            where: {
                active: true
            },
            select: {
                id: true,
                name: true,
                slug: true,
                logo: true,
                active: true,
                createdAt: true,
                updatedAt: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(categories, {status: 200});
    } catch (error) {
        if (error instanceof Error) {
            console.error('[CATEGORIES] ', error.message)
            return NextResponse.json(
                { error: `[CATEGORIES] Erreur interne : ${error ? error.message : 'Erreur inconnue'}` },
                { status: 500 }
            );
        }
    }
}

export async function POST(req: NextRequest) {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized", statusCode: 401 }, { status: 401 });
    }

    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
    const { success } = await rateLimiter.limit(ip);

    if (!success) {
        return NextResponse.json({ error: "Trop de demandes" }, { status: 429 });
    }

    try {
        const formData = await req.formData();
        const name = formData.get('name') as string;
        const logo = formData.get('logo') as File | null;

        const slug = slugifyName(name);

        const result = await db.$transaction(async (tx) => {
            // Check if category exists
            const existingCategory = await tx.categories.findUnique({
                where: { slug },
                select: { id: true }
            });

            if (existingCategory) throw new Error("CATEGORY_EXISTS")

            // Create category
            const category = await tx.categories.create({
                data: {
                    name: name,
                    slug: slug
                },
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    logo: true,
                    createdAt: true
                }
            });

            let logoUrl: string | null = null;

            // Upload logo if provided
            if (logo && logo.size > 0) {
                try {
                    console.log('[UPLOAD] Uploading logo for category:', category.slug);
                    const uploadData = { logo };
                    const uploadResult = await ImageUploadService.uploadLogo('categories', category.slug, uploadData);

                    if (uploadResult.success) {
                        logoUrl = uploadResult.logo || null;
                        console.log('[UPLOAD] Logo uploaded successfully:', logoUrl);
                    } else {
                        console.error('[UPLOAD] Upload failed:', uploadResult.error);
                        // Continue without logo rather than failing completely
                    }
                } catch (uploadError) {
                    console.error('[UPLOAD] Error uploading logo:', uploadError);
                    // Continue without logo rather than failing completely
                }
            }

            // Update category with logo URL if uploaded
            const updatedCategory = await tx.categories.update({
                where: { id: category.id },
                data: {
                    ...(logoUrl && { logo: logoUrl })
                },
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    logo: true,
                    createdAt: true
                }
            });

            return updatedCategory;
        });

        return NextResponse.json(
            {
                category: result,
                redirect: `/admin/categories/${result.slug}`
            },
            { status: 201 }
        );
    } catch (error) {
        if (error instanceof Error) {
            console.error('[CATEGORY] ', error.message)
            
            if (error.message === "CATEGORY_EXISTS") {
                return NextResponse.json({ error: "La catégorie existe déjà" }, { status: 400 });
            }
            
            return NextResponse.json(
                { error: `[CATEGORY] Erreur interne : ${error.message}` },
                { status: 500 }
            );
        }
    }
}