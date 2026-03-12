import {NextRequest, NextResponse} from "next/server";
import {db} from "@/lib/db";
import {rateLimiter} from "@/lib/utils";
import {auth} from "@clerk/nextjs/server";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_req: NextRequest) {
    try {
        const stocks = await db.stocks.findMany({
            select: {
                id: true,
                minQuantity: true,
                quantity: true,
                createdAt: true,
                updatedAt: true,
                product: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        price: true,
                        thumbnail: true
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        return NextResponse.json(stocks, {status: 200});
    } catch (error) {
        if (error instanceof Error) {
            console.error('[STOCKS] ', error.message)
        }
        return new NextResponse('Internal Error', { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized", statusCode: 401 }, { status: 401 });
        }

        const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
        const { success } = await rateLimiter.limit(ip);

        if (!success) {
            return NextResponse.json({ error: "Trop de demandes" }, { status: 429 });
        }

        const { minQuantity, quantity, productId } = await req.json();

        if (!minQuantity || !quantity || !productId) {
            return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400});
        }

        const stock = await db.$transaction(async (tx) => {
            // Parallel validation queries
            const [existingProduct, existingStock] = await Promise.all([
                tx.products.findUnique({
                    where: { id: productId },
                    select: { id: true }
                }),
                tx.stocks.findFirst({
                    where: { productId: productId },
                    select: { id: true }
                })
            ]);

            if (!existingProduct) {
                throw new Error("PRODUCT_NOT_FOUND");
            }

            if (existingStock) {
                throw new Error("STOCK_EXISTS");
            }

            // Create stock
            return tx.stocks.create({
                data: {
                    minQuantity: minQuantity,
                    quantity: quantity,
                    productId: productId // Direct assignment instead of connect
                },
                select: {
                    id: true,
                    minQuantity: true,
                    quantity: true,
                    createdAt: true,
                    product: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                            price: true,
                            thumbnail: true
                        }
                    }
                }
            });
        });

        return NextResponse.json({
            stock,
            redirect: `/admin/stocks`
        }, { status: 201 });
    } catch (error) {
        if (error instanceof Error) {
            console.error('[STOCKS] ', error.message);

            switch (error.message) {
                case "PRODUCT_NOT_FOUND":
                    return NextResponse.json({ error: "Produit introuvable" }, { status: 404 });
                case "STOCK_EXISTS":
                    return NextResponse.json({
                        error: "Le produit est déjà en stock, veuillez mettre à jour les stocks."
                    }, { status: 400 });
                default:
                    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
            }
        }
        return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
    }
}

