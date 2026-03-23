import {Prisma} from "@prisma/client";
import {computeDiscountedPrice} from "@/lib/discounts/compute-discounted-price";

type DbClient = Prisma.TransactionClient;

export async function refreshProductDiscount(tx: DbClient, productId: string) {
    const now = new Date();

    const product = await tx.products.findUnique({
        where: { id: productId },
        select: {
            id: true,
            price: true,
            categoryId: true,
        }
    });

    if (!product) {
        return;
    }

    const productDiscount = await tx.discounts.findFirst({
        where: {
            productId: product.id,
            active: true,
            startDate: { lte: now },
            OR: [
                { endDate: null },
                { endDate: { gte: now } }
            ]
        },
        orderBy: {
            startDate: "desc"
        }
    });

    if (productDiscount) {
        await tx.products.update({
            where: { id: product.id },
            data: {
                discountPrice: computeDiscountedPrice(
                    product.price,
                    productDiscount.discountAmount,
                    productDiscount.discountType
                ),
                discountAmount: productDiscount.discountAmount,
                promote: true
            }
        });

        return;
    }

    const categoryDiscount = await tx.discounts.findFirst({
        where: {
            categoryId: product.categoryId,
            active: true,
            startDate: { lte: now },
            OR: [
                { endDate: null },
                { endDate: { gte: now } }
            ]
        },
        orderBy: {
            startDate: "desc"
        }
    });

    if (categoryDiscount) {
        await tx.products.update({
            where: { id: product.id },
            data: {
                discountPrice: computeDiscountedPrice(
                    product.price,
                    categoryDiscount.discountAmount,
                    categoryDiscount.discountType
                ),
                discountAmount: categoryDiscount.discountAmount,
                promote: true
            }
        });

        return;
    }

    await tx.products.update({
        where: { id: product.id },
        data: {
            discountPrice: null,
            discountAmount: null,
            promote: false
        }
    });

    console.log("REFRESH NOW", now.toISOString());
}