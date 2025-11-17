import {NextRequest, NextResponse} from "next/server";
import {rateLimiter} from "@/lib/utils";
import {db} from "@/lib/db";

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

        const products = await db.products.findMany({
            where: {
                active: true
            },
            include: {
                stocks: {
                    select: {
                        quantity: true,
                        createdAt: true,
                        updatedAt: true
                    }
                }
            }
        })

        if (!products) return NextResponse.json({
            error: "Aucun produit n'a été trouvé"
        }, { status: 404 })

        const res = NextResponse.json(products, {status: 200})
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