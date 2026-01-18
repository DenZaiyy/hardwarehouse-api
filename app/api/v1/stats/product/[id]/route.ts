import {NextRequest, NextResponse} from "next/server";
import {rateLimiter} from "@/lib/utils";
import {db} from "@/lib/db";

type TStockItems = {
    quantity: number;
    createdAt: Date;
    updatedAt: Date;
}

export async function GET(req: NextRequest, ctx: RouteContext<'/api/v1/stats/product/[id]'>) {
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
                stock: true
            }
        })

        if (!product) return NextResponse.json({
            error: "Le produit n'a pas été trouvé"
        }, { status: 404 })

        const stock: TStockItems = {
            quantity: product.stock?.quantity || 0,
            createdAt: product.stock?.createdAt || new Date(),
            updatedAt: product.stock?.updatedAt || new Date()
        }

        if (!stock) return NextResponse.json({
            error: "Le stock du produit n'a pas été trouvé"
        }, { status: 404 })


        const res = NextResponse.json(
            {
                quantityInStock: stock.quantity,
                stock
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