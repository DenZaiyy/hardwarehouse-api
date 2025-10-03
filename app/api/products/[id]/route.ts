import {NextRequest, NextResponse} from "next/server";
import {db} from "@/lib/db";
import {slugifyName} from "@/lib/utils";

interface UpdateProductData {
    name?: string;
    slug?: string;
    price?: number;
    image?: string;
    categoryId?: string;
}

export async function GET(_req: NextRequest, ctx: RouteContext<'/api/products/[id]'>) {
    const { id } = await ctx.params;

    try {
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
            return new NextResponse('Product not found', { status: 404 });
        }

        return NextResponse.json(product, { status: 200 });
    } catch (error) {
        console.error('[PRODUCT] ', error)
        return new NextResponse('Internal Error', { status: 500 });
    }
}

export async function PATCH(_req: NextRequest, ctx: RouteContext<'/api/products/[id]'>) {
    const { id } = await ctx.params;
    const { name, price, image, categoryId } = await _req.json();

    // Vérifier qu'au moins un champ est fourni
    if (!name && !price && !image && !categoryId) {
        return new NextResponse("At least one field is required", { status: 400 });
    }

    try {
        // Construire l'objet de données dynamiquement
        const updateData: UpdateProductData = {};
        const product = await db.products.findUnique({
            where: { id }
        })

        if (!product) {
            return new NextResponse('Product not found', { status: 404 });
        }

        if (name !== product.name) {
            updateData.name = name;
            // Générer le slug seulement si le nom change
            updateData.slug = slugifyName(name);
        }

        if (price !== product.price) updateData.price = price;
        if (image !== product.image) updateData.image = image;
        if (categoryId) updateData.categoryId = categoryId;

        const updatedProduct = await db.products.update({
            where: {
                id: id
            },
            data: updateData
        });

        return NextResponse.json(updatedProduct, { status: 200 });
    } catch(error) {
        console.error('[PRODUCT PATCH] ', error)
        return new NextResponse('Internal Error', { status: 500 });
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
            return new NextResponse('Product not found', { status: 404 });
        }

        await db.products.delete({
            where: {
                id
            }
        });

        return new NextResponse(`Product with id ${id} deleted`, { status: 200 });
    } catch (error) {
        console.error('[PRODUCT DELETE] ', error)
        return new NextResponse('Internal Error', { status: 500 });
    }
}