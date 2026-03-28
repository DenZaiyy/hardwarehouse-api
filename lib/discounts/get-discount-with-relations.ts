import {DiscountWithRelations, PrismaTx} from "./types";

export async function getDiscountWithRelations(
    tx: PrismaTx,
    id: string
): Promise<DiscountWithRelations | null> {
    return tx.discounts.findUnique({
        where: { id },
        select: {
            id: true,
            active: true,
            productId: true,
            categoryId: true,
            product: { select: { id: true, name: true } },
            category: {
                select: {
                    id: true,
                    name: true,
                    Products: { select: { id: true } },
                },
            },
        },
    });
}