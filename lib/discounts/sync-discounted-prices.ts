import {Prisma} from "@prisma/client";
import {db} from "@/lib/db";
import {refreshProductDiscount} from "@/lib/discounts/refresh-product-discount";

type DbClient = Prisma.TransactionClient;

/**
 * Recalcule le prix remisé recopié sur les produits (discountPrice, discountAmount, promote) quand une période de
 * remise commence ou finit. Seuls les produits concernés sont relus : ceux affichés en promotion, dont la remise a pu
 * finir, et ceux couverts par une remise active en cours, qui a pu commencer.
 * L'interrupteur active d'une remise n'est jamais modifié ici : il appartient au back-office, et la période ne fait
 * qu'encadrer une remise active (refreshProductDiscount).
 * @returns le nombre de produits réécrits
 */
export async function syncDiscountedPrices(client: DbClient = db, now: Date = new Date()): Promise<number> {
    const [promoted, inProgress] = await Promise.all([
        client.products.findMany({
            where: { promote: true },
            select: { id: true }
        }),
        client.discounts.findMany({
            where: {
                active: true,
                startDate: { lte: now },
                OR: [
                    { endDate: null },
                    { endDate: { gte: now } }
                ]
            },
            select: {
                productId: true,
                category: { select: { Products: { select: { id: true } } } }
            }
        }),
    ]);

    const productIds = new Set(promoted.map(({ id }) => id));
    for (const discount of inProgress) {
        if (discount.productId) productIds.add(discount.productId);
        for (const product of discount.category?.Products ?? []) productIds.add(product.id);
    }

    // Un produit après l'autre : quelques dizaines de lectures toutes les 5 minutes, sans pic sur la base
    let rewritten = 0;
    for (const productId of productIds) {
        if (await refreshProductDiscount(client, productId, now)) rewritten++;
    }

    return rewritten;
}
