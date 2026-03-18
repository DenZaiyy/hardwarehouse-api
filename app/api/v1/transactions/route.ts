import {NextRequest, NextResponse} from "next/server";
import {db} from "@/lib/db";
import {auth, currentUser} from "@clerk/nextjs/server";
import {rateLimiter} from "@/lib/utils";

export async function GET(req: NextRequest) {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized", statusCode: 401 }, { status: 401 });
    }

    let remaining = 0;
    let reset = 0;

    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';


    try {
        const result = await rateLimiter.limit(ip);
        remaining = result.remaining ? result.remaining : 0;
        reset = result.reset ? result.reset : 0;

        if (!result.success) {
            return NextResponse.json(
                { error: "Trop de demandes" },
                { status: 429 }
            );
        }
    } catch (err) {
        console.warn('Rate limiter unavailable', err);
    }


    try {
        const transactions = await db.transactions.findMany({
            select: {
                id: true,
                type: true,
                oldQtt: true,
                newQtt: true,
                userId: true,
                userFullName: true,
                createdAt: true,
                product: {
                    select: {
                        id: true,
                        name: true,
                        active: true,
                        slug: true,
                        price: true,
                        thumbnail: true
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        if (transactions.length > 0) {
            console.log("plus de 1");
        } else {

        }

        const res = NextResponse.json(transactions, { status: 200 });
        res.headers.set('X-RateLimit-Remaining', remaining.toString());
        res.headers.set('X-RateLimit-Reset', reset.toString());

        return res;
    } catch (error) {
        if (error instanceof Error) {
            console.error('[TRANSACTIONS] allo', error.message)

            return NextResponse.json(
                {error: `[TRANSACTIONS] Erreur interne : ${error ? error.message : 'Erreur inconnue'}`},
                {status: 500}
            );
        }
    }
}

export async function POST(req: NextRequest) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized", statusCode: 401 }, { status: 401 });
        }

        const { type, finalQuantity, oldQtt, newQtt, productId } = await req.json();
        console.error(type)
        const user = await currentUser()

        let userFullName = "Undefined User"

        if (user && user.fullName) userFullName = user.fullName

        if (!oldQtt && !newQtt && !productId) return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 })

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

        const transaction = await db.transactions.create({
            data: {
                oldQtt,
                newQtt: finalQuantity,
                type,
                userFullName: userFullName,
                product: {
                    connect: {
                        id: productId
                    }
                },
                userId
            }
        })

        if (transaction) {
            await db.stocks.upsert({
                where: { productId },
                update: { quantity: finalQuantity },
                create: {
                    product: {
                        connect: {
                            id: productId
                        }
                    },
                    quantity: finalQuantity
                }
            })
        }

        return NextResponse.json(transaction, { status: 200 })

    } catch (e) {
        if (e instanceof  Error) {
            console.error(e.message);
            return NextResponse.json({ error: "[TRANSACTION POST] Une erreur est survenue lors de la création d'une transaction" }, { status: 500 })
        }
    }
}