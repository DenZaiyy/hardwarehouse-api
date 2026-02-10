import {NextRequest, NextResponse} from "next/server";
import {db} from "@/lib/db";
import {rateLimiter, slugifyName} from "@/lib/utils";
import {auth} from "@clerk/nextjs/server";

interface UpdateProductData {
    name?: string;
    slug?: string;
    description?: string;
    shortDescription?: string;
    price?: number;
    active?: boolean;
    thumbnail?: string;
    images?: string[];
    categoryId?: string;
}

interface RouteParams {
    params: Promise<{ slug: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
    try {
        const { slug } = await params;

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
                thumbnail: true,
                images: true,
                shortDescription: true,
                description: true,
                createdAt: true,
                updatedAt: true,
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
                stock: {
                    select: {
                        quantity: true
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

export async function PATCH(req: NextRequest, { params }: RouteParams) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized", statusCode: 401 }, { status: 401 });
        }

        const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
        const { slug } = await params;
        const { name, price, description, shortDescription, active, thumbnail, images, categoryId, attributes } = await req.json();

        // Vérifier qu'au moins un champ est fourni
        if (!name && !price && !description && !shortDescription && !images && !thumbnail && !categoryId && !active) {
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
        // Mettre à jour la description seulement si elle change
        if (description !== product.description) updateData.description = description;
        // Mettre à jour la shortDescription seulement si elle change
        if (shortDescription !== product.shortDescription) updateData.shortDescription = shortDescription;
        // Mettre à jour les images seulement si elles changent
        if (images && JSON.stringify(images) !== JSON.stringify(product.images)) updateData.images = images;
        // Mettre à jour le prix seulement s'il change
        if (price !== product.price) updateData.price = price;
        // Mettre à jour le status actif seulement s'il change
        if (active !== product.active) updateData.active = active;
        // Mettre à jour l'image seulement si elle change
        if (thumbnail !== product.thumbnail) updateData.thumbnail = thumbnail;
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
                    shortDescription: true,
                    description: true,
                    price: true,
                    active: true,
                    thumbnail: true,
                    images: true,
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

export async function DELETE(_req: NextRequest, { params }: RouteParams) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized", statusCode: 401 });
        }

        const { slug } = await params;

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