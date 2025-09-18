import {NextRequest, NextResponse} from "next/server";
import {db} from "@/lib/db";
import slugify from "slugify";

type TProductParams = {
    params: Promise<{ id: string}>
}

interface UpdateProductData {
    name?: string;
    slug?: string;
    price?: number;
    image?: string;
    categoryId?: string;
}

export async function GET(req: NextRequest, { params }: TProductParams) {
    const { id } = await params;

    try {
        const product = await db.products.findUnique({
            where: {
                id: id
            }
        });

        return NextResponse.json(product, { status: 200 });
    } catch (error) {
        console.error('[PRODUCT] ', error)
        return new NextResponse('Internal Error', { status: 500 });
    }
}

export async function PATCH(req: NextRequest, { params }: TProductParams) {
    const { id } = await params;
    const { name, price, image, categoryId } = await req.json();

    // Vérifier qu'au moins un champ est fourni
    if (!name && !price && !image && !categoryId) {
        return new NextResponse("At least one field is required", { status: 400 });
    }

    try {
        // Construire l'objet de données dynamiquement
        const updateData: UpdateProductData = {};

        if (name) {
            updateData.name = name;
            // Générer le slug seulement si le nom change
            updateData.slug = slugify(name, {
                lower: true,
                strict: true,
                locale: 'fr'
            });
        }

        if (price !== undefined) updateData.price = price;
        if (image !== undefined) updateData.image = image;
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

export async function DELETE(req: NextRequest, { params } : TProductParams) {
    const { id } = await params;

    try {
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