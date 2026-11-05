import {Prisma} from "@prisma/client";
import {computeDiscountedPrice} from "@/lib/discounts/compute-discounted-price";

type DbClient = Prisma.TransactionClient;

/**
 * Recopie sur le produit la remise qui s'applique à `now` : une remise active dont la période est en cours, celle du
 * produit d'abord, sinon celle de sa catégorie, la plus récente en cas de chevauchement. Sans remise applicable, le
 * produit revient au plein tarif. Rien n'est écrit si le produit est déjà à jour : updatedAt garde la date du dernier
 * vrai changement, alors que la synchronisation repasse sur chaque produit remisé.
 * @returns true si le produit a été réécrit
 */
export async function refreshProductDiscount(tx: DbClient, productId: string, now: Date = new Date()): Promise<boolean> {
    const product = await tx.products.findUnique({
        where: { id: productId },
        select: {
            id: true,
            price: true,
            categoryId: true,
            discountPrice: true,
            discountAmount: true,
            promote: true,
        }
    });

    if (!product) {
        return false;
    }

    const inProgress = {
        active: true,
        startDate: { lte: now },
        OR: [
            { endDate: null },
            { endDate: { gte: now } }
        ]
    };

    const discount =
        await tx.discounts.findFirst({
            where: { productId: product.id, ...inProgress },
            orderBy: { startDate: "desc" }
        })
        ?? await tx.discounts.findFirst({
            where: { categoryId: product.categoryId, ...inProgress },
            orderBy: { startDate: "desc" }
        });

    const target = discount
        ? {
            discountPrice: computeDiscountedPrice(product.price, discount.discountAmount, discount.discountType),
            discountAmount: discount.discountAmount,
            promote: true
        }
        : {
            discountPrice: null,
            discountAmount: null,
            promote: false
        };

    if (
        product.discountPrice === target.discountPrice
        && product.discountAmount === target.discountAmount
        && product.promote === target.promote
    ) {
        return false;
    }

    await tx.products.update({
        where: { id: product.id },
        data: target
    });

    return true;
}
