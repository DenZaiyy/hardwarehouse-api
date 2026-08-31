import {NextRequest, NextResponse} from "next/server";
import {db} from "@/lib/db";
import {rateLimiter} from "@/lib/utils";
import {requireAuth} from "@/lib/auth/require-role";
import {handleApiError} from "@/lib/api/handle-api-error";
import {ConflictError, NotFoundError} from "@/lib/api/errors";
import {stockSchema} from "@/lib/validators/stockSchema";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_req: NextRequest) {
    const { response } = await requireAuth();
    if (response) return response;

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
        return handleApiError("STOCKS GET", error);
    }
}

export async function POST(req: NextRequest) {
    const { response } = await requireAuth();
    if (response) return response;

    try {
        const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
        const { success } = await rateLimiter.limit(ip);

        if (!success) {
            return NextResponse.json({ error: "Trop de demandes" }, { status: 429 });
        }

        const { minQuantity, quantity, productId } = stockSchema.parse(await req.json());

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
                throw new NotFoundError("Produit");
            }

            if (existingStock) {
                throw new ConflictError("Le produit est déjà en stock, veuillez mettre à jour les stocks.");
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
        return handleApiError("STOCKS POST", error);
    }
}

