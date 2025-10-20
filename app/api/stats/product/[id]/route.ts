import {NextRequest, NextResponse} from "next/server";
import {rateLimiter} from "@/lib/utils";
import {db} from "@/lib/db";

type TStockItems = {
    quantity: number;
    createdAt: Date;
    updatedAt: Date;
}

export async function GET(req: NextRequest, ctx: RouteContext<'/api/stats/product/[id]'>) {
    try {
        const { id } = await ctx.params;
        const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
        const { success, remaining, reset } = await rateLimiter.limit(ip);

        if (!success) {
            return NextResponse.json(
                { error: "Trop de demandes" },
                { status: 429 }
            );
        }

        const product = await db.products.findUnique({
            where: {
                id
            },
            include: {
                stocks: true
            }
        })

        if (!product) return NextResponse.json({
            error: "Le produit n'a pas été trouvé"
        }, { status: 404 })

        const stocks = product.stocks
        const stockItems: TStockItems[] = []

        const totalProductStock = stocks.reduce((acc, s) => acc + s.quantity, 0)

        stocks.forEach((stock) => {
            stockItems.push({
                quantity: stock.quantity,
                createdAt: stock.createdAt,
                updatedAt: stock.updatedAt
            })
        })

        const res = NextResponse.json(
            {
                totalProductInStock: totalProductStock,
                items: stockItems
            }, { status: 200 }
        )
        res.headers.set('X-RateLimit-Remaining', remaining.toString());
        res.headers.set('X-RateLimit-Reset', reset.toString());

        return res
    } catch (err) {
        if (err instanceof Error) {
            console.error('[STATS PRODUCT] ', err.message)
            return NextResponse.json('Internal Error', { status: 500 });
        }
    }
}