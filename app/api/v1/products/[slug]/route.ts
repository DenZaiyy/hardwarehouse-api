import {NextRequest, NextResponse} from "next/server";
import {db} from "@/lib/db";
import {rateLimiter, slugifyName} from "@/lib/utils";
import {auth} from "@clerk/nextjs/server";

interface UpdateProductData {
    name?: string;
    slug?: string;
    price?: number;
    active?: boolean;
    image?: string;
    categoryId?: string;
}

export async function GET(req: NextRequest, ctx: RouteContext<'/api/v1/products/[slug]'>) {
    try {
        const { slug } = await ctx.params;

        // Only select needed fields and use efficient ordering
        const product = await db.products.findUnique({
            where: {
                slug,
            },
            select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                active: true,
                image: true,
                createdAt: true,
                updatedAt: true,
                categoryId: true,
                brandId: true,
                brand: {
                    select: {
                        id: true,
                        name: true,
                        slug: true
                    }
                },
                category: {
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
                                displayOrder: true,
                                required: true,
                                attribute: {
                                    select: {
                                        id: true,
                                        name: true,
                                        type: true
                                    }
                                }
                            }
                        }
                    },
                    orderBy: {
                        categoryAttribute: {
                            displayOrder: 'asc'
                        }
                    }
                }
            }
        });

        if (!product) {
            return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 });
        }

        return NextResponse.json(product, {status: 200});
    } catch (error) {
        if (error instanceof Error) {
            console.error('[PRODUCT] ', error.message)
            return NextResponse.json(
                {error: `[PRODUCT] Erreur interne : ${error ? error.message : 'Erreur inconnue'}`},
                {status: 500}
            );
        }
    }
}

export async function PATCH(req: NextRequest, ctx: RouteContext<'/api/v1/products/[slug]'>) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized", statusCode: 401 }, { status: 401 });
        }

        const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
        const { slug } = await ctx.params;
        const { name, price, active, image, categoryId, attributes } = await req.json();

        // Vérifier qu'au moins un champ est fourni
        if (!name && !price && !image && !categoryId && !active) {
            return NextResponse.json("Au moins un champ est obligatoire.", { status: 400 });
        }

        const { success, remaining, reset } = await rateLimiter.limit(ip);

        if (!success) {
            return NextResponse.json(
                { error: "Trop de demandes" },
                { status: 429 }
            );
        }

        // Construire l'objet de données dynamiquement
        const updateData: UpdateProductData = {};
        const product = await db.products.findUnique({
            where: { slug }
        })

        if (!product) {
            return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 });
        }

        const productId = product.id;

        // Mettre à jour le slug seulement si le nom change
        if (name !== product.name) {
            updateData.name = name;
            updateData.slug = slugifyName(name);
        }

        // Mettre à jour le prix seulement s'il change
        if (price !== product.price) updateData.price = price;
        // Mettre à jour le status actif seulement s'il change
        if (active !== product.active) updateData.active = active;
        // Mettre à jour l'image seulement si elle change
        if (image !== product.image) updateData.image = image;
        // Mettre à jour la categoryId seulement si elle change
        if (categoryId) updateData.categoryId = categoryId;

        const updatedProduct = await db.$transaction(async (tx) => {
            // Update product
            const product = await tx.products.update({
                where: { slug },
                data: updateData,
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    price: true,
                    active: true,
                    image: true,
                    createdAt: true,
                    updatedAt: true,
                    categoryId: true,
                    brandId: true,
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
                                    displayOrder: true,
                                    required: true,
                                    attribute: {
                                        select: {
                                            id: true,
                                            name: true,
                                            type: true
                                        }
                                    }
                                }
                            }
                        },
                        orderBy: {
                            categoryAttribute: {
                                displayOrder: 'asc'
                            }
                        }
                    }
                }
            });

            // Update attribute values if provided
            if (attributes) {
                // Delete and recreate in same transaction
                await tx.productAttributeValues.deleteMany({
                    where: { productId }
                });

                const attributeValueData = Object.entries(attributes)
                    .filter(([, value]) => value && String(value).trim() !== '')
                    .map(([categoryAttributeId, value]) => ({
                        productId,
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

        const res = NextResponse.json(updatedProduct, { status: 200 })
        res.headers.set('X-RateLimit-Remaining', remaining.toString());
        res.headers.set('X-RateLimit-Reset', reset.toString());

        return res;
    } catch(error) {
        if (error instanceof Error) {
            console.error('[PRODUCT PATCH] ', error.message)
            return NextResponse.json(
                { error: `[PRODUCT PATCH] Erreur interne : ${error ? error.message : 'Erreur inconnue'}` },
                { status: 500 }
            );
        }
    }
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<'/api/v1/products/[slug]'>) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized", statusCode: 401 });
        }

        const { slug } = await ctx.params;

        const product = await db.products.findUnique({
            where: { slug }
        })

        if (!product) {
            return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 });
        }

        const productId = product.id;

        await db.products.delete({
            where: {
                slug
            }
        });

        return new NextResponse(`Product with id ${productId} deleted`, { status: 200 });
    } catch(error) {
        if (error instanceof Error) {
            console.error('[PRODUCT DELETE] ', error.message)
            return NextResponse.json(
                { error: `[PRODUCT DELETE] Erreur interne : ${error ? error.message : 'Erreur inconnue'}` },
                { status: 500 }
            )
        }
    }
}