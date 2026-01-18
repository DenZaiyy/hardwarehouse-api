import {NextRequest, NextResponse} from "next/server";
import {db} from "@/lib/db";
import {rateLimiter, slugifyName} from "@/lib/utils";
import {auth} from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
    try {
        // Only load necessary fields for list performance
        const products = await db.products.findMany({
            select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                active: true,
                image: true,
                createdAt: true,
                updatedAt: true,
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
                productAttributeValues: {
                    select: {
                        id: true,
                        value: true,
                        categoryAttribute: {
                            select: {
                                id: true,
                                required: true,
                                displayOrder: true,
                                attribute: {
                                    select: {
                                        id: true,
                                        name: true,
                                        type: true
                                    }
                                }
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(products, {status: 200});
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

    const { name, image, price, active, categoryId, brandId, attributes } = await req.json();

    console.log('[PRODUCTS POST] Request data:', { name, image, price, active, categoryId, brandId, attributes });

    if (!name || price === undefined || price === null || !categoryId || !brandId) {
        return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400});
    }

    const slug = slugifyName(name)

    try {
        // 🚀 OPTIMIZATION 1: Use transaction with parallel validation
        // This ensures atomicity and parallel execution of validation queries
        const result = await db.$transaction(async (tx) => {
            // Parallel validation queries (much faster than sequential)
            const [existingProduct, existingCategory, existingBrand] = await Promise.all([
                tx.products.findUnique({
                    where: { slug },
                    select: { id: true } // Only select ID for existence check
                }),
                tx.categories.findUnique({  // 🚀 OPTIMIZATION 2: Use findUnique instead of findMany
                    where: { id: categoryId },
                    select: { id: true }
                }),
                tx.brands.findUnique({
                    where: { id: brandId },
                    select: { id: true }
                })
            ]);

            // Validation checks
            if (existingProduct) {
                throw new Error("PRODUCT_EXISTS");
            }
            if (!existingCategory) {
                throw new Error("CATEGORY_NOT_FOUND");
            }
            if (!existingBrand) {
                throw new Error("BRAND_NOT_FOUND");
            }

            // Create product
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
                    price: price,
                    active: active,
                    image: image,
                    categoryId: categoryId,  // 🚀 OPTIMIZATION 3: Direct assignment instead of connect
                    brandId: brandId
                }
            });

            // 🚀 OPTIMIZATION 4: Create attributes in same transaction
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

            return product;
        });

        return NextResponse.json(
            {
                product: result,
                redirect: `/admin/products/${result.id}`
            },
            { status: 201 }
        );
    } catch (error) {
        if (error instanceof Error) {
            console.error('[PRODUCTS] ', error.message)
            
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
            { error: "[PRODUCTS POST] Erreur inconnue" },
            { status: 500 }
        );
    }
}

