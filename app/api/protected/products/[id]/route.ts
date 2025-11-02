import {NextRequest, NextResponse} from "next/server";
import {db} from "@/lib/db";
import {rateLimiter, slugifyName} from "@/lib/utils";

interface UpdateProductData {
    name?: string;
    slug?: string;
    price?: number;
    active?: boolean;
    image?: string;
    categoryId?: string;
}

export async function GET(req: NextRequest, ctx: RouteContext<'/api/products/[id]'>) {
    const { id } = await ctx.params;
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';

    try {
        const { success, remaining, reset } = await rateLimiter.limit(ip);

        if (!success) {
            return NextResponse.json(
                {error: "Trop de demandes"},
                { status: 429 }
            );
        }

        const product = await db.products.findUnique({
            where: {
                id: id,
            },
            include: {
                brand: true,
                category: true,
            }
        });

        if (!product) {
            return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 });
        }

        const res = NextResponse.json(product, { status: 200 })
        res.headers.set('X-RateLimit-Remaining', remaining.toString());
        res.headers.set('X-RateLimit-Reset', reset.toString());

        return res;
    } catch (error) {
        if (error instanceof Error) {
            console.error('[PRODUCT] ', error.message)
            return NextResponse.json(
                {error: `[PRODUCT] Erreur interne : ${error ? error.message : 'Erreur inconnue'}`},
                {status: 500}
            );
        }
    }
}

export async function PATCH(req: NextRequest, ctx: RouteContext<'/api/products/[id]'>) {
    try {
        const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
        const { id } = await ctx.params;
        const { name, price, active, image, categoryId } = await req.json();

        // Vérifier qu'au moins un champ est fourni
        if (!name && !price && !image && !categoryId && !active) {
            return NextResponse.json("Au moins un champ est obligatoire.", { status: 400 });
        }

        const { success, remaining, reset } = await rateLimiter.limit(ip);

        if (!success) {
            return NextResponse.json(
                { error: "Trop de demandes" },
                { status: 429 }
            );
        }

        // Construire l'objet de données dynamiquement
        const updateData: UpdateProductData = {};
        const product = await db.products.findUnique({
            where: { id }
        })

        if (!product) {
            return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 });
        }

        // Mettre à jour le slug seulement si le nom change
        if (name !== product.name) {
            updateData.name = name;
            updateData.slug = slugifyName(name);
        }

        // Mettre à jour le prix seulement s'il change
        if (price !== product.price) updateData.price = price;
        // Mettre à jour le status actif seulement s'il change
        if (active !== product.active) updateData.active = active;
        // Mettre à jour l'image seulement si elle change
        if (image !== product.image) updateData.image = image;
        // Mettre à jour la categoryId seulement si elle change
        if (categoryId) updateData.categoryId = categoryId;

        const updatedProduct = await db.products.update({
            where: {
                id: id
            },
            data: updateData
        });

        const res = NextResponse.json(updatedProduct, { status: 200 })
        res.headers.set('X-RateLimit-Remaining', remaining.toString());
        res.headers.set('X-RateLimit-Reset', reset.toString());

        return res;
    } catch(error) {
        if (error instanceof Error) {
            console.error('[PRODUCT PATCH] ', error.message)
            return NextResponse.json(
                { error: `[PRODUCT PATCH] Erreur interne : ${error ? error.message : 'Erreur inconnue'}` },
                { status: 500 }
            );
        }
    }
}