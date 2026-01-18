import {NextRequest, NextResponse} from "next/server";
import {db} from "@/lib/db";
import {auth, currentUser} from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
    try {
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

        return NextResponse.json(purchases, {status: 200});
    } catch (error) {
        if (error instanceof Error) {
            console.error('[TRANSACTIONS] ', error.message)
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

        const { quantity, productId } = await req.json();
        const user = await currentUser()

        let userFullName = "Undefined User"

        if (user && user.fullName) userFullName = user.fullName

        if (!quantity && !productId) return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 })

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