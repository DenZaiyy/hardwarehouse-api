import {NextRequest, NextResponse} from "next/server";
import {db} from "@/lib/db";
import {rateLimiter, slugifyName} from "@/lib/utils";

export async function GET(req: NextRequest) {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';

    try {
        const { success, remaining, reset } = await rateLimiter.limit(ip);

        if (!success) {
            return NextResponse.json(
                { error: "Trop de demandes" },
                { status: 429 }
            );
        }

        const products = await db.products.findMany({
            include: {
                category: true,
                stocks: true,
                brand: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        const res = NextResponse.json(products, { status: 200 });
        res.headers.set('X-RateLimit-Remaining', remaining.toString());
        res.headers.set('X-RateLimit-Reset', reset.toString());

        return res;
    } catch (error) {
        if (error instanceof Error) {
            console.error('[PRODUCTS] ', error.message)
            return NextResponse.json(
                { error: `[PRODUCTS] Erreur interne : ${error ? error.message : 'Erreur inconnue'}` },
                { status: 500 }
            );
        }

    }
}

export async function POST(req: NextRequest) {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
    const { success } = await rateLimiter.limit(ip);

    if (!success) {
        return new NextResponse('Too Many Requests', { status: 429 });
    }

    const { name, price, categoryId, brandId } = await req.json();

    if (!name || !price || !categoryId || !brandId) return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400});

    const slug = slugifyName(name)

    const existingProduct = await db.products.findUnique({
        where: { slug }
    })

    if (existingProduct) {
        return NextResponse.json(
            { error: "Le produit existe déjà" },
            { status: 400 }
        );
    }

    const existingCategory = await db.categories.findMany({
        where: { id: categoryId }
    })

    if (!existingCategory) {
        return NextResponse.json(
            { error: 'Catégorie inexistante' },
            { status: 400 }
        );
    }

    const existingBrand = await db.brands.findUnique({
        where: { id: brandId }
    })

    if (!existingBrand) {
        return NextResponse.json(
            { error: 'La marque n\'existe pas.' },
            { status: 404 }
        );
    }

    try {
        const product = await db.products.create({
            include: {
                category: true,
                brand:  true
            },
            data: {
                name: name,
                slug: slug,
                price: price,
                image: "",
                category: {
                    connect: { id: categoryId }
                },
                brand: {
                    connect: { id: brandId }
                }
            }
        })

        return NextResponse.json(
            {
                product,
                redirect: `/admin/products/${product.id}`
            },
            { status: 201 }
        );
    } catch (error) {
        if (error instanceof Error) {
            console.error('[PRODUCTS] ', error.message)
            return NextResponse.json(
                { error: `[PRODUCTS POST] Erreur interne : ${error ? error.message : 'Erreur inconnue'}` },
                { status: 500 }
            );
        }

    }
}

