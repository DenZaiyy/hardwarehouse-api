import {NextRequest, NextResponse} from "next/server";
import {currentUser} from "@clerk/nextjs/server";
import {db} from "@/lib/db";
import {clientIp, rateLimiter} from "@/lib/rate-limit";
import {requireStaff} from "@/lib/auth/require-role";
import {handleApiError} from "@/lib/api/handle-api-error";
import {ConflictError, NotFoundError} from "@/lib/api/errors";
import {recordStockMovement} from "@/lib/stocks/stock-movements";
import {stockSchema} from "@/lib/validators/stockSchema";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_req: NextRequest) {
    const { response } = await requireStaff();
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
    const { userId, response } = await requireStaff();
    if (response) return response;

    try {
        const ip = clientIp(req);
        const { success } = await rateLimiter.limit(ip);

        if (!success) {
            return NextResponse.json({ error: "Trop de demandes" }, { status: 429 });
        }

        const { minQuantity, quantity, productId } = stockSchema.parse(await req.json());
        const user = await currentUser();
        const author = { userId, userFullName: user?.fullName ?? "Undefined User" };

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

            // La quantité de départ est une entrée : elle laisse son mouvement, comme toute autre (lib/stocks)
            if (quantity > 0) {
                await recordStockMovement(tx, { productId, oldQuantity: 0, newQuantity: quantity }, author);
            }

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

