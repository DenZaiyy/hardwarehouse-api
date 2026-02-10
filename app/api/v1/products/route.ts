import {NextRequest, NextResponse} from "next/server";
import {db} from "@/lib/db";
import {rateLimiter, slugifyName} from "@/lib/utils";
import {auth} from "@clerk/nextjs/server";
import {ImageUploadService} from "@/services/image-upload.service";
import {buildMeta, buildProductWhere, parseFilters, parsePagination, parseSort} from "@/lib/api/filters";

interface uploadData {
    thumbnail?: File;
    images?: Map<number, File>;
}

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = req.nextUrl;

        const pagination = parsePagination(searchParams);
        const sort = parseSort(searchParams);
        const filters = parseFilters(searchParams);
        const where = buildProductWhere(filters);

        const [products, total] = await Promise.all([
            db.products.findMany({
                where,
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    price: true,
                    thumbnail: true,
                    shortDescription: true,
                    createdAt: true,
                    updatedAt: true,
                    active: true,
                    category: {
                        select: {
                            id: true,
                            name: true,
                            slug: true
                        }
                    },
                    brand: {
                        select: {
                            id: true,
                            name: true,
                            slug: true
                        }
                    },
                },
                orderBy: { [sort.sortBy]: sort.order },
                skip: pagination.skip,
                take: pagination.limit
            }),
            db.products.count({ where })
        ]);

        return NextResponse.json({
            data: products,
            meta: buildMeta(total, pagination)
        }, { status: 200 });
    } catch (error) {
        if (error instanceof Error) {
            console.error('[PRODUCTS] ', error.message)
            return NextResponse.json(
                { error: `[PRODUCTS] Erreur interne : ${error ? error.message : 'Erreur inconnue'}` },
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
        return new NextResponse('Too Many Requests', { status: 429 });
    }

    try {
        const formData = await req.formData();
        
        // Extract form fields
        const name = formData.get('name') as string;
        const description = formData.get('description') as string;
        const shortDescription = formData.get('shortDescription') as string;
        const price = parseFloat(formData.get('price') as string);
        const active = formData.get('active') === 'true';
        const category = formData.get('category') as string;
        const brandId = formData.get('brandId') as string;
        const attributesJson = formData.get('attributes') as string;
        
        // Parse attributes if provided
        let attributes = {};
        if (attributesJson) {
            try {
                attributes = JSON.parse(attributesJson);
            } catch (error) {
                console.error('Error parsing attributes:', error);
            }
        }

        // Extract files
        const thumbnailFile = formData.get('thumbnail') as File | null;
        const imageFiles = formData.getAll('images') as File[];

        console.log('[PRODUCTS POST] Request data:', { 
            name, 
            description, 
            shortDescription, 
            price, 
            active, 
            category,
            brandId, 
            attributes,
            hasThumbnail: !!thumbnailFile,
            imageCount: imageFiles.length
        });

        if (!name || price === undefined || isNaN(price) || !category || !brandId) {
            return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400});
        }

        const slug = slugifyName(name);

        const result = await db.$transaction(async (tx) => {
            // Vérifications d'existence en parallèle
            const [existingProduct, existingCategory, existingBrand] = await Promise.all([
                tx.products.findUnique({
                    where: { slug },
                    select: { id: true }
                }),
                tx.categories.findUnique({
                    where: { slug: category },
                    select: { id: true }
                }),
                tx.brands.findUnique({
                    where: { id: brandId },
                    select: { id: true }
                })
            ]);

            // Validation checks
            if (existingProduct) throw new Error("PRODUCT_EXISTS");
            if (!existingCategory) throw new Error("CATEGORY_NOT_FOUND");
            if (!existingBrand) throw new Error("BRAND_NOT_FOUND");

            // Create product first with basic data
            const product = await tx.products.create({
                include: {
                    category: true,
                    brand: true,
                    productAttributeValues: {
                        include: {
                            categoryAttribute: {
                                include: {
                                    attribute: true
                                }
                            }
                        }
                    }
                },
                data: {
                    name: name,
                    slug: slug,
                    description: description,
                    shortDescription: shortDescription,
                    price: price,
                    active: active,
                    categoryId: existingCategory.id,
                    brandId: existingBrand.id
                }
            });

            // Upload images using our WebP system
            let thumbnailUrl = null;
            let imageUrls: string[] = [];

            // Prepare upload data in the format expected by ImageUploadService
            const uploadData: uploadData = {};
            
            if (thumbnailFile && thumbnailFile.size > 0) {
                uploadData.thumbnail = thumbnailFile;
            }
            
            if (imageFiles && imageFiles.length > 0) {
                const validImageFiles = imageFiles.filter(file => file.size > 0);
                if (validImageFiles.length > 0) {
                    const imageMap = new Map<number, File>();
                    validImageFiles.forEach((file, index) => {
                        imageMap.set(index, file);
                    });
                    uploadData.images = imageMap;
                }
            }

            // Upload all images at once if any are provided
            if (uploadData.thumbnail || uploadData.images) {
                try {
                    console.log('[UPLOAD] Uploading images for product:', product.slug);
                    const uploadResult = await ImageUploadService.uploadProductImages(product.slug, uploadData);
                    
                    if (uploadResult.success) {
                        thumbnailUrl = uploadResult.thumbnail || null;
                        imageUrls = uploadResult.images || [];
                        console.log('[UPLOAD] Images uploaded successfully:', { thumbnailUrl, imageUrls });
                    } else {
                        console.error('[UPLOAD] Upload failed:', uploadResult.error);
                        // Continue without images rather than failing completely
                    }
                } catch (uploadError) {
                    console.error('[UPLOAD] Error uploading images:', uploadError);
                    // Continue without images rather than failing completely
                }
            }

            // Update product with uploaded image URLs
            const updatedProduct = await tx.products.update({
                where: { id: product.id },
                data: {
                    ...(thumbnailUrl && { thumbnail: thumbnailUrl }),
                    ...(imageUrls.length > 0 && { images: imageUrls })
                },
                include: {
                    category: true,
                    brand: true,
                    productAttributeValues: {
                        include: {
                            categoryAttribute: {
                                include: {
                                    attribute: true
                                }
                            }
                        }
                    }
                }
            });

            // Create attributes in same transaction
            if (attributes && Object.keys(attributes).length > 0) {
                const attributeValueData = Object.entries(attributes)
                    .filter(([, value]) => value && String(value).trim() !== '')
                    .map(([categoryAttributeId, value]) => ({
                        productId: product.id,
                        categoryAttributeId: categoryAttributeId,
                        value: String(value)
                    }));

                if (attributeValueData.length > 0) {
                    await tx.productAttributeValues.createMany({
                        data: attributeValueData
                    });
                }
            }

            return updatedProduct;
        });

        return NextResponse.json(
            {
                product: result,
                redirect: `/admin/products/${result.slug}`
            },
            { status: 201 }
        );
    } catch (error) {
        if (error instanceof Error) {
            console.error('[PRODUCTS POST]', error.message);
            
            // Handle specific validation errors
            switch (error.message) {
                case "PRODUCT_EXISTS":
                    return NextResponse.json(
                        { error: "Le produit existe déjà" },
                        { status: 400 }
                    );
                case "CATEGORY_NOT_FOUND":
                    return NextResponse.json(
                        { error: "Catégorie inexistante" },
                        { status: 400 }
                    );
                case "BRAND_NOT_FOUND":
                    return NextResponse.json(
                        { error: "La marque n'existe pas" },
                        { status: 404 }
                    );
                default:
                    return NextResponse.json(
                        { error: `[PRODUCTS POST] Erreur interne : ${error.message}` },
                        { status: 500 }
                    );
            }
        }

        return NextResponse.json(
            { error: "Erreur inconnue" },
            { status: 500 }
        );
    }
}

