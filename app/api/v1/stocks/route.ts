import {NextRequest, NextResponse} from "next/server";
import {db} from "@/lib/db";
import {rateLimiter} from "@/lib/utils";
import {auth} from "@clerk/nextjs/server";

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

        const stocks = await db.stocks.findMany({
            include: {
                product: true
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        const res = NextResponse.json(stocks, { status: 200 });
        res.headers.set('X-RateLimit-Remaining', remaining.toString());
        res.headers.set('X-RateLimit-Reset', reset.toString());

        return res;
    } catch (error) {
        if (error instanceof Error) {
            console.error('[STOCKS] ', error.message)
        }
        return new NextResponse('Internal Error', { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized", statusCode: 401 }, { status: 401 });
        }

        const { minQuantity, quantity, productId } = await req.json();

        if (!minQuantity && !quantity && !productId) return new NextResponse("Missing required fields", { status: 400});

        const existingProduct = await db.products.findUnique({
            where: { id: productId }
        })

        if (existingProduct) {
            const existingStock = await db.stocks.findFirst({
                where: { productId: existingProduct.id }
            })

            if (existingStock) {
                return new NextResponse("Le produit est déjà en stock, veuillez mettre à jour les stocks.", { status: 400 });
            }
        }

        const stock = await db.stocks.create({
            include: {
                product: true
            },
            data: {
                minQuantity: minQuantity,
                quantity: quantity,
                product: {
                    connect: { id: productId }
                },
            }
        })

        return NextResponse.json({
            stock,
            redirect: `/admin/stocks`
        });
    } catch (error) {
        if (error instanceof Error) {
            console.error('[STOCKS] ', error.message)
        }
        return new NextResponse("Internal Error", { status: 500 });
    }
}

