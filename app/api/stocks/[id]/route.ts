import {NextRequest, NextResponse} from "next/server";
import {db} from "@/lib/db";

interface UpdateStockData {
    quantity?: number;
    productId?: string;
}

export async function GET(_req: NextRequest, ctx: RouteContext<'/api/stocks/[id]'>) {
    const { id } = await ctx.params;

    try {
        const stock = await db.stocks.findUnique({
            where: {
                id: id
            },
            include: {
                product: true,
            }
        });

        if (!stock) {
            return new NextResponse('Stock not found', { status: 404 });
        }

        return NextResponse.json(stock, { status: 200 });
    } catch (error) {
        console.error('[STOCK] ', error)
        return new NextResponse('Internal Error', { status: 500 });
    }
}

export async function PATCH(_req: NextRequest, ctx: RouteContext<'/api/stocks/[id]'>) {
    const { id } = await ctx.params;
    const { quantity, productId } = await _req.json();

    // Vérifier qu'au moins un champ est fourni
    if (!quantity && !productId) {
        return new NextResponse("At least one field is required", { status: 400 });
    }

    try {
        // Construire l'objet de données dynamiquement
        const updateData: UpdateStockData = {};
        const stock = await db.stocks.findUnique({
            where: { id }
        })

        if (!stock) {
            return new NextResponse('Stock not found', { status: 404 });
        }

        if (quantity !== stock.quantity) {
            updateData.quantity = quantity;
        }
        if (productId) updateData.productId = productId;

        const updatedStock = await db.stocks.update({
            where: {
                id: id
            },
            data: updateData
        });

        return NextResponse.json(updatedStock, { status: 200 });
    } catch(error) {
        console.error('[STOCK PATCH] ', error)
        return new NextResponse('Internal Error', { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<'/api/stocks/[id]'>) {
    const { id } = await ctx.params;

    try {
        const stock = await db.stocks.findUnique({
            where: {
                id
            }
        });

        if (!stock) {
            return new NextResponse('Stock not found', { status: 404 });
        }

        await db.stocks.delete({
            where: {
                id
            }
        });

        return new NextResponse(`Stock with id ${id} deleted`, { status: 200 });
    } catch (error) {
        console.error('[STOCK DELETE] ', error)
        return new NextResponse('Internal Error', { status: 500 });
    }
}