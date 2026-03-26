import {NextRequest, NextResponse} from "next/server";
import {db} from "@/lib/db";
import {refreshProductDiscount} from "@/lib/discounts/refresh-product-discount";

interface RouteParams {
    params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, ctx: RouteContext<'/api/v1/discounts/[id]'>) {
    try {
        const { id } = await ctx.params;

        const discount = await db.discounts.findUnique({
            where: {
                id
            },
            include: {
                category: true,
                product: true,
            }
        });


        if (!discount) {
            return NextResponse.json(
                { error: 'Remise introuvable' },
                { status: 404 }
            );
        }

        return NextResponse.json(discount, {status: 200});
    } catch (error) {
        if (error instanceof Error) {
            console.error('[DISCOUNT] ', error.message)
            return NextResponse.json(
                { error: `[DISCOUNT] Erreur interne : ${error ? error.message : 'Erreur inconnue'}` },
                { status: 500 }
            );
        }
    }
}


export async function DELETE(_req: NextRequest, { params }: RouteParams) {
    try {
        const { id } = await params;

        const result = await db.$transaction(async (tx) => {
            const discount = await tx.discounts.findUnique({
                where: { id },
                select: {
                    id: true,
                    productId: true,
                    categoryId: true,
                    product: {
                        select: {
                            id: true,
                            name: true
                        }
                    },
                    category: {
                        select: {
                            id: true,
                            name: true,
                            Products: {
                                select: {
                                    id: true
                                }
                            }
                        }
                    }
                }
            });

            if (!discount) {
                throw new Error("DISCOUNT_NOT_FOUND");
            }

            await tx.discounts.delete({
                where: { id }
            });

            if (discount.productId && discount.product) {
                await refreshProductDiscount(tx, discount.productId);

                return {
                    type: "product",
                    message: `Discount for product "${discount.product.name}" deleted`
                };
            }

            if (discount.categoryId && discount.category) {
                for (const product of discount.category.Products) {
                    await refreshProductDiscount(tx, product.id);
                }

                return {
                    type: "category",
                    message: `Discount for category "${discount.category.name}" deleted`
                };
            }

            return {
                type: "unknown",
                message: "Discount deleted"
            };
        });

        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        if (error instanceof Error) {
            console.error("[DISCOUNT DELETE]", error.message);

            if (error.message === "DISCOUNT_NOT_FOUND") {
                return NextResponse.json(
                    { error: "Remise introuvable" },
                    { status: 404 }
                );
            }

            return NextResponse.json(
                { error: `[DISCOUNT DELETE] Erreur interne : ${error.message}` },
                { status: 500 }
            );
        }

        return NextResponse.json(
            { error: "[DISCOUNT DELETE] Erreur inconnue" },
            { status: 500 }
        );
    }
}