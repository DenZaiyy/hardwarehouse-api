import {NextRequest, NextResponse} from "next/server";
import {Prisma} from "@prisma/client";
import {db} from "@/lib/db";
import {requireShop} from "@/lib/auth/require-shop";
import {handleApiError} from "@/lib/api/handle-api-error";
import {ConflictError, NotFoundError} from "@/lib/api/errors";
import {stockExitSchema} from "@/lib/validators/stockExitSchema";

/**
 * Sortie de stock d'une commande payée, appelée par la boutique de serveur à serveur :
 * - le stock et ses mouvements sont écrits dans une seule transaction ;
 * - jamais de stock négatif : toute la sortie est refusée (409) et la boutique alerte un administrateur ;
 * - idempotente : une commande ne sort du stock qu'une fois (index unique sur sa référence).
 */
export async function POST(req: NextRequest) {
    const denied = requireShop(req);
    if (denied) return denied;

    let orderReference: string | undefined;

    try {
        const exit = stockExitSchema.parse(await req.json());
        orderReference = exit.orderReference;

        if (await db.stockExits.findUnique({where: {orderReference}})) {
            return NextResponse.json({orderReference, alreadyRecorded: true}, {status: 200});
        }

        const reference = orderReference;
        await db.$transaction(async (tx) => {
            await tx.stockExits.create({data: {orderReference: reference}});

            for (const {productId, quantity} of exit.lines) {
                const stock = await tx.stocks.findUnique({where: {productId}});
                if (!stock) throw new NotFoundError(`Stock du produit ${productId}`);

                if (stock.quantity < quantity) {
                    throw new ConflictError(`Stock insuffisant pour le produit ${productId} : ${stock.quantity} disponible(s), ${quantity} demandé(s)`);
                }

                await tx.stocks.update({where: {productId}, data: {quantity: {decrement: quantity}}});
                await tx.transactions.create({
                    data: {
                        type: false,
                        oldQtt: stock.quantity,
                        newQtt: stock.quantity - quantity,
                        orderReference: reference,
                        userFullName: `Boutique, commande ${reference}`,
                        product: {connect: {id: productId}},
                    },
                });
            }
        });

        return NextResponse.json({orderReference, movements: exit.lines.length}, {status: 201});
    } catch (error) {
        // Deux appels simultanés pour la même commande : le second heurte l'index unique
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            return NextResponse.json({orderReference, alreadyRecorded: true}, {status: 200});
        }

        return handleApiError("STOCK EXIT POST", error);
    }
}
