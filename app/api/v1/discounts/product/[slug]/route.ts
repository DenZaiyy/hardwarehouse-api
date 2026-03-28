import {NextRequest, NextResponse} from "next/server";
import {db} from "@/lib/db";
import {handleApiError} from "@/lib/api/handle-api-error";

type RouteCtx = RouteContext<'/api/v1/discounts/product/[slug]'>;

export async function GET(_req: NextRequest, ctx: RouteCtx) {
    try {
        const { slug } = await ctx.params;

        const product = await db.products.findUnique({
            select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                discountPrice: true,
                promote: true,
                active: true,
                createdAt: true,
                updatedAt: true,
                category: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        active: true
                    }
                },
                brand: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        active: true,
                    }
                }
            },
            where: {
                slug
            }
        });

        if (!product) {
            return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 });
        }

        return NextResponse.json(product, { status: 200 });
    } catch (error) {
        return handleApiError('DISCOUNT PRODUCT', error);
    }
}