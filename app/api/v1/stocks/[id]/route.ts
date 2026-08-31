import {NextRequest, NextResponse} from "next/server";
import {db} from "@/lib/db";
import {currentUser} from "@clerk/nextjs/server";
import {requireAdmin, requireAuth} from "@/lib/auth/require-role";
import {handleApiError} from "@/lib/api/handle-api-error";
import {NotFoundError} from "@/lib/api/errors";
import {stockPatchSchema} from "@/lib/validators/stockSchema";

interface UpdateStockData {
    quantity?: number;
    productId?: string;
}

export async function GET(_req: NextRequest, ctx: RouteContext<'/api/v1/stocks/[id]'>) {
    const { response } = await requireAuth();
    if (response) return response;

    try {
        const { id } = await ctx.params;

        const stock = await db.stocks.findUnique({
            where: {
                id: id
            },
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        price: true,
                        thumbnail: true
                    }
                },
            }
        });

        if (!stock) throw new NotFoundError("Stock");

        return NextResponse.json(stock, {status: 200});
    } catch (error) {
        return handleApiError("STOCK GET", error);
    }
}

export async function PATCH(_req: NextRequest, ctx: RouteContext<'/api/v1/stocks/[id]'>) {
    const { userId, response } = await requireAuth();
    if (response) return response;

    try {
        const { id } = await ctx.params;
        const { quantity, productId } = stockPatchSchema.parse(await _req.json());

        // Vérifier qu'au moins un champ est fourni
        if (quantity === undefined && !productId) {
            return new NextResponse("At least one field is required", { status: 400 });
        }

        const stock = await db.stocks.findUnique({
            where: { id }
        })

        if (!stock) throw new NotFoundError("Stock");

        // Construire l'objet de données dynamiquement
        const updateData: UpdateStockData = {};
        const quantityChanged = quantity !== undefined && quantity !== stock.quantity;
        if (quantityChanged) updateData.quantity = quantity;
        if (productId) updateData.productId = productId;

        const updatedStock = await db.$transaction(async (tx) => {
            const updated = await tx.stocks.update({
                where: { id },
                data: updateData
            });

            // La table Transactions est un historique dérivé : on ne la crée jamais
            // manuellement, elle est générée automatiquement à chaque changement de quantité.
            if (quantityChanged) {
                const user = await currentUser();

                await tx.transactions.create({
                    data: {
                        oldQtt: stock.quantity,
                        newQtt: quantity,
                        type: quantity > stock.quantity,
                        userId,
                        userFullName: user?.fullName ?? "Undefined User",
                        product: {
                            connect: { id: updateData.productId ?? stock.productId }
                        }
                    }
                });
            }

            return updated;
        });

        return NextResponse.json(updatedStock, { status: 200 });
    } catch(error) {
        return handleApiError("STOCK PATCH", error);
    }
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<'/api/v1/stocks/[id]'>) {
    const { response } = await requireAdmin();
    if (response) return response;

    try {
        const { id } = await ctx.params;
        const stock = await db.stocks.findUnique({
            where: {
                id
            }
        });

        if (!stock) throw new NotFoundError("Stock");

        await db.stocks.delete({
            where: {
                id
            }
        });

        return new NextResponse(`Stock with id ${id} deleted`, { status: 200 });
    } catch (error) {
        return handleApiError("STOCK DELETE", error);
    }
}