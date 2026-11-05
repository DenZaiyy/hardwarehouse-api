import {NextRequest, NextResponse} from "next/server";
import {db} from "@/lib/db";
import {currentUser} from "@clerk/nextjs/server";
import {requireStaff} from "@/lib/auth/require-role";
import {handleApiError} from "@/lib/api/handle-api-error";
import {BadRequestError, ConflictError, NotFoundError} from "@/lib/api/errors";
import {changeStockQuantity} from "@/lib/stocks/stock-movements";
import {stockPatchSchema} from "@/lib/validators/stockSchema";

export async function GET(_req: NextRequest, ctx: RouteContext<'/api/v1/stocks/[id]'>) {
    const { response } = await requireStaff();
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

export async function PATCH(req: NextRequest, ctx: RouteContext<'/api/v1/stocks/[id]'>) {
    const { userId, response } = await requireStaff();
    if (response) return response;

    try {
        const { id } = await ctx.params;
        const { quantity, minQuantity, productId } = stockPatchSchema.parse(await req.json());

        if (quantity === undefined && minQuantity === undefined) {
            throw new BadRequestError("Indiquez une quantité ou un seuil d'alerte.");
        }

        const user = await currentUser();
        const author = { userId, userFullName: user?.fullName ?? "Undefined User" };

        const updatedStock = await db.$transaction(async (tx) => {
            // Lu dans la transaction : la quantité remplacée est celle que le mouvement enregistre (lib/stocks)
            const stock = await tx.stocks.findUnique({ where: { id } });
            if (!stock) throw new NotFoundError("Stock");

            // Le formulaire renvoie le produit du stock : en changer fausserait l'historique des deux produits
            if (productId !== undefined && productId !== stock.productId) {
                throw new BadRequestError("Le produit d'un stock ne peut pas changer.");
            }

            if (quantity !== undefined) {
                await changeStockQuantity(tx, stock, quantity, author);
            }

            if (minQuantity !== undefined && minQuantity !== stock.minQuantity) {
                await tx.stocks.update({ where: { id }, data: { minQuantity } });
            }

            return tx.stocks.findUniqueOrThrow({ where: { id } });
        });

        return NextResponse.json(updatedStock, { status: 200 });
    } catch(error) {
        return handleApiError("STOCK PATCH", error);
    }
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<'/api/v1/stocks/[id]'>) {
    const { response } = await requireStaff();
    if (response) return response;

    try {
        const { id } = await ctx.params;

        await db.$transaction(async (tx) => {
            const stock = await tx.stocks.findUnique({ where: { id } });
            if (!stock) throw new NotFoundError("Stock");

            // Supprimer un stock non vide ferait disparaître des articles sans aucun mouvement : la quantité passe
            // d'abord à 0 par une modification, qui laisse sa sortie dans l'historique
            if (stock.quantity !== 0) {
                throw new ConflictError(`Ce stock contient encore ${stock.quantity} article(s) : passez sa quantité à 0 avant de le supprimer.`);
            }

            const { count } = await tx.stocks.deleteMany({ where: { id, quantity: 0 } });
            if (count !== 1) {
                throw new ConflictError("Le stock a été modifié entre-temps : rechargez la page, puis recommencez.");
            }
        });

        return new NextResponse(`Stock with id ${id} deleted`, { status: 200 });
    } catch (error) {
        return handleApiError("STOCK DELETE", error);
    }
}