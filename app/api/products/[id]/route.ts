import {NextRequest, NextResponse} from "next/server";
import {db} from "@/lib/db";
import {rateLimiter, slugifyName} from "@/lib/utils";

interface UpdateProductData {
    name?: string;
    slug?: string;
    price?: number;
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
                id: id
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

export async function PATCH(_req: NextRequest, ctx: RouteContext<'/api/products/[id]'>) {
    const ip = _req.headers.get('x-forwarded-for') || _req.headers.get('x-real-ip') || '127.0.0.1';
    const { id } = await ctx.params;
    const { name, price, image, categoryId } = await _req.json();

    // Vérifier qu'au moins un champ est fourni
    if (!name && !price && !image && !categoryId) {
        return NextResponse.json({ error: "Au moins un champ est obligatoire." }, { status: 400 });
    }

    try {
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

export async function DELETE(_req: NextRequest, ctx: RouteContext<'/api/products/[id]'>) {
    const { id } = await ctx.params;

    try {
        const product = await db.products.findUnique({
            where: {
                id
            }
        });

        if (!product) {
            return NextResponse.json({ error: 'Produit introuvable' }, { status: 404 });
        }

        await db.products.delete({
            where: {
                id
            }
        });

        return new NextResponse(`Product with id ${id} deleted`, { status: 200 });
    } catch (error) {
        if (error instanceof Error) {
            console.error('[PRODUCT DELETE] ', error.message)
            return NextResponse.json(
                { error: `[PRODUCT DELETE] Erreur interne : ${error ? error.message : 'Erreur inconnue'}` },
                { status: 500 }
            );
        }
    }
}