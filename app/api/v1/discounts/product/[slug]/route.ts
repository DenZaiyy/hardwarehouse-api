import {NextRequest, NextResponse} from "next/server";
import {db} from "@/lib/db";

interface RouteParams {
    params: Promise<{ slug: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
    try {
        const { slug } = await params;

        const product = await db.products.findUnique({
            select: {
                id: true,
                name: true,
                slug: true,
                price: true,
                discountPrice: true,
                promote: true,
                active: true,
                createdAt: true,
                updatedAt: true,
                category: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        active: true
                    }
                },
                brand: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        active: true,
                    }
                }
            },
            where: {
                slug
            }
        });

        if (!product) {
            return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 });
        }

        return NextResponse.json(product, { status: 200 });
    } catch (error) {
        if (error instanceof Error) {
            console.error('[DISCOUNT PRODUCT] ', error.message)
            return NextResponse.json(
                { error: `[DISCOUNT PRODUCT] Erreur interne : ${error ? error.message : 'Erreur inconnue'}` },
                { status: 500 }
            );
        }

    }
}