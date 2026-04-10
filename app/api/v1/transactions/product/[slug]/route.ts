import {NextRequest, NextResponse} from "next/server";
import {db} from "@/lib/db";

export async function GET(_req: NextRequest, ctx: RouteContext<'/api/v1/transactions/product/[slug]'>) {
    try {
       /* const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized", statusCode: 401 }, { status: 401 });
        }*/

        const { slug } = await ctx.params;

        const existingProduct = await db.products.findUnique({
            where: { slug },
            select: { slug: true }
        });

        if (!existingProduct) {
            throw new Error("PRODUCT_NOT_FOUND");
        }

        const transactions = await db.transactions.findMany({
            where: {
                product: { slug: slug}
            },
        });

        if (!transactions) {
            return new NextResponse('Transactions not found', { status: 404 });
        }



        return NextResponse.json({
            data: transactions,
            total: transactions.length,
        }, { status: 200 });
    } catch (error) {
        console.error('[PRODUCT TRANSACTIONS] ', error)
        return new NextResponse('Internal Error', { status: 500 });
    }
}