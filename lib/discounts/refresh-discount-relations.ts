import {refreshProductDiscount} from "./refresh-product-discount";
import {DiscountActionResult, DiscountWithRelations, PrismaTx} from "./types";

export async function refreshDiscountRelations(
    tx: PrismaTx,
    discount: DiscountWithRelations,
    action: "updated" | "deleted"
): Promise<DiscountActionResult> {
    if (discount.productId && discount.product) {
        await refreshProductDiscount(tx, discount.productId);
        return {
            type: "product",
            message: `Discount for product "${discount.product.name}" ${action}`,
        };
    }

    if (discount.categoryId && discount.category) {
        // Promise.all évite le N+1 séquentiel (1 aller-retour DB par produit de la catégorie).
        await Promise.all(
            discount.category.Products.map((product) => refreshProductDiscount(tx, product.id))
        );
        return {
            type: "category",
            message: `Discount for category "${discount.category.name}" ${action}`,
        };
    }

    return { type: "unknown", message: `Discount ${action}` };
}