import {NextRequest, NextResponse} from "next/server";
import {db} from "@/lib/db";
import {auth, currentUser} from "@clerk/nextjs/server";
import {rateLimiter} from "@/lib/utils";

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

        const purchases = await db.purchaseOrder.findMany({
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        price: true
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        const res = NextResponse.json(purchases, { status: 200 });
        res.headers.set('X-RateLimit-Remaining', remaining.toString());
        res.headers.set('X-RateLimit-Reset', reset.toString());

        return res;
    } catch (error) {
        if (error instanceof Error) {
            console.error('[TRANSACTIONS] ', error.message)
        }
        return new NextResponse('Internal Error', { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const { quantity, productId } = await req.json();
        const { userId } = await auth()
        const user = await currentUser()

        let userFullName = "Undefined User"

        if (user && user.fullName) userFullName = user.fullName

        if (!quantity && !productId && !userId || userId === null) return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 })

        const existingProduct = await db.products.findUnique({
            where: {
                id: productId
            }
        })

        if (!existingProduct) {
            return NextResponse.json({
                error: "Le produit n'existe pas"
            }, { status: 400 })
        }

        const purchaseOrder = await db.purchaseOrder.create({
            data: {
                quantity,
                userFullName,
                product: {
                    connect: {
                        id: productId
                    }
                },
                userId
            }
        })

        if (purchaseOrder) {
            // Generate PDF

        }

        return NextResponse.json(purchaseOrder, { status: 200 })

    } catch (e) {
        if (e instanceof  Error) {
            console.error(e.message);
            return NextResponse.json({ error: "[TRANSACTION POST] Une erreur est survenue lors de la création d'une transaction" })
        }
    }
}