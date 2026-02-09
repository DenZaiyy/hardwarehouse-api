import {NextRequest, NextResponse} from "next/server";
import {db} from "@/lib/db";
import {rateLimiter, slugifyName} from "@/lib/utils";
import {auth} from "@clerk/nextjs/server";
import {buildBrandWhere, buildMeta, parseFilters, parsePagination, parseSort} from "@/lib/api/filters";
import {ImageUploadService} from "@/services/image-upload.service";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = req.nextUrl;

        const pagination = parsePagination(searchParams);
        const sort = parseSort(searchParams);
        const filters = parseFilters(searchParams);
        const where = buildBrandWhere(filters);

        const [brands, total] = await Promise.all([
            db.brands.findMany({
                where,
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    logo: true,
                    active: true,
                    createdAt: true,
                    updatedAt: true
                },
                orderBy: { [sort.sortBy]: sort.order },
                skip: pagination.skip,
                take: pagination.limit
            }),
            db.brands.count({ where })
        ]);

        return NextResponse.json({
            data: brands,
            meta: buildMeta(total, pagination)
        }, {status: 200});
    } catch (error) {
        if (error instanceof Error) {
            console.error('[BRANDS] ', error.message)
            return NextResponse.json(
                { error: `[BRANDS] Erreur interne : ${error ? error.message : 'Erreur inconnue'}` },
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
            // Check if brand exists
            const existingBrand = await tx.brands.findUnique({
                where: { slug },
                select: { id: true }
            });

            if (existingBrand) throw new Error("BRAND_EXISTS")

            // Create brand
            const brand = await tx.brands.create({
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
                    console.log('[UPLOAD] Uploading logo for brand:', brand.slug);
                    const uploadData = { logo };
                    const uploadResult = await ImageUploadService.uploadLogo('brands', brand.slug, uploadData);

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

            // Update brand with logo URL if uploaded
            const updatedBrand = await tx.brands.update({
                where: { id: brand.id },
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

            return updatedBrand;
        });

        return NextResponse.json(
            {
                brand: result,
                redirect: `/admin/brands/${result.slug}`
            },
            { status: 201 }
        );
    } catch (error) {
        if (error instanceof Error) {
            console.error('[BRAND] ', error.message)
            
            if (error.message === "BRAND_EXISTS") {
                return NextResponse.json({ error: "La marque existe déjà" }, { status: 400 });
            }
            
            return NextResponse.json(
                { error: `[BRAND] Erreur interne : ${error.message}` },
                { status: 500 }
            );
        }
    }
}