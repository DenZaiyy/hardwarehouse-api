import {NextRequest, NextResponse} from "next/server";
import {rateLimiter} from "@/lib/utils";
import {db} from "@/lib/db";

type TStockDataItem = {
    quantity: number;
    productName: string
    createdAt: Date
    updatedAt: Date
}

export async function GET(req: NextRequest) {
    try {
        const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
        const { success, remaining, reset } = await rateLimiter.limit(ip);

        if (!success) {
            return NextResponse.json(
                { error: "Trop de demandes" },
                { status: 429 }
            );
        }

        const stockItems: TStockDataItem[] = []

        const stocks = await db.stocks.findMany({
            include: {
                product: {
                    select: {
                        name: true,
                        price: true
                    }
                }
            }
        })

        if (!stocks) return NextResponse.json({
            error: "Aucun stock n'a été trouvé"
        }, { status: 404 })

        const totalStockValue = stocks.reduce((acc, s) => acc + s.quantity * s.product.price, 0)
        const totalProductStock = stocks.reduce((acc, s) => acc + s.quantity, 0)

        stocks.forEach((stock) => {
            stockItems.push({
                quantity: stock.quantity,
                productName: stock.product.name,
                createdAt: stock.createdAt,
                updatedAt: stock.updatedAt,
            })
        })

        if (stockItems.length === 0) return NextResponse.json({error: "Aucune données ont été récupérer"}, { status: 404 })

        const res = NextResponse.json(
            {
                totalStockValue: Number((totalStockValue).toFixed(2)),
                totalProductInStock: totalProductStock,
                items: stockItems
            }, {status: 200}
        )
        res.headers.set('X-RateLimit-Remaining', remaining.toString());
        res.headers.set('X-RateLimit-Reset', reset.toString());

        return res
    } catch (e) {
        if (e instanceof Error) {
            console.error('[STATS STOCK] ', e.message)
            return NextResponse.json('Internal Error', { status: 500 });
        }
    }
    return new Response('Statistic endpoint for stock data', { status: 200 });
}