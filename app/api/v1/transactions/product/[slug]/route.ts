import {NextRequest, NextResponse} from "next/server";
import {db} from "@/lib/db";
import {requireAdmin} from "@/lib/auth/require-role";
import {handleApiError} from "@/lib/api/handle-api-error";
import {NotFoundError} from "@/lib/api/errors";

export async function GET(_req: NextRequest, ctx: RouteContext<'/api/v1/transactions/product/[slug]'>) {
    const { response } = await requireAdmin();
    if (response) return response;

    try {
        const { slug } = await ctx.params;

        const existingProduct = await db.products.findUnique({
            where: { slug },
            select: { slug: true }
        });

        if (!existingProduct) throw new NotFoundError("Produit");

        const transactions = await db.transactions.findMany({
            where: {
                product: { slug: slug}
            },
        });

        return NextResponse.json({
            data: transactions,
            total: transactions.length,
        }, { status: 200 });
    } catch (error) {
        return handleApiError("PRODUCT TRANSACTIONS", error);
    }
}