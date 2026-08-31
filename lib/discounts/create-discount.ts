import {Prisma} from "@prisma/client";
import {refreshProductDiscount} from "./refresh-product-discount";
import {NotFoundError} from "@/lib/api/errors";
import {CategoryDiscountAlreadyExistsError, ProductDiscountAlreadyExistsError} from "./errors";
import {DiscountInput} from "./validate-discount-input";

type PrismaTx = Prisma.TransactionClient;

export async function createDiscount(tx: PrismaTx, input: DiscountInput) {
    const now = new Date();
    const { productId, categoryId, discountAmount, discountType, active, startDate, endDate } = input;

    const activeDiscountWhere = {
        active: true,
        startDate: { lte: now },
        OR: [{ endDate: null }, { endDate: { gte: now } }],
    };

    if (productId) {
        const product = await tx.products.findUnique({
            where: { id: productId },
            select: { id: true, name: true },
        });

        if (!product) throw new NotFoundError("Produit");

        const existing = await tx.discounts.findFirst({
            where: { productId, ...activeDiscountWhere },
            select: { id: true },
        });

        if (existing) throw new ProductDiscountAlreadyExistsError();

        const discount = await tx.discounts.create({
            data: { productId, discountAmount, discountType, active, startDate, endDate: endDate ?? null },
            include: { product: { select: { id: true, name: true, price: true } } },
        });

        await refreshProductDiscount(tx, productId);

        return discount;
    }

    // categoryId forcément défini ici (validé en amont)
    const category = await tx.categories.findUnique({
        where: { id: categoryId! },
        select: { id: true, name: true, slug: true, Products: { select: { id: true } } },
    });

    if (!category) throw new NotFoundError("Catégorie");

    const existing = await tx.discounts.findFirst({
        where: { categoryId: categoryId!, ...activeDiscountWhere },
        select: { id: true },
    });

    if (existing) throw new CategoryDiscountAlreadyExistsError();

    const discount = await tx.discounts.create({
        data: { categoryId, discountAmount, discountType, active, startDate, endDate: endDate ?? null },
        include: { category: { select: { id: true, name: true, slug: true } } },
    });

    // Promise.all évite le N+1 séquentiel (1 aller-retour DB par produit de la catégorie).
    await Promise.all(category.Products.map((product) => refreshProductDiscount(tx, product.id)));

    return discount;
}