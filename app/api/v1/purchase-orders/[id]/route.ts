import {NextRequest, NextResponse} from "next/server";
import {db} from "@/lib/db";
import {auth} from "@clerk/nextjs/server";

export async function GET(_req: NextRequest, ctx: RouteContext<'/api/v1/purchase-orders/[id]'>) {
    try {
        const { id } = await ctx.params;

        const purchaseOrder = await db.purchaseOrder.findUnique({
            where: {
                id: id
            },
            include: {
                product: true,
            }
        });

        if (!purchaseOrder) {
            return new NextResponse('Purchase order not found', { status: 404 });
        }

        return NextResponse.json(purchaseOrder, {status: 200});
    } catch (error) {
        console.error('[PURCHASE ORDER] ', error)
        return new NextResponse('Internal Error', { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<'/api/v1/purchase-orders/[id]'>) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized", statusCode: 401 }, { status: 401 });
        }

        const { id } = await ctx.params;
        const purchaseOrder = await db.purchaseOrder.findUnique({
            where: {
                id
            }
        });

        if (!purchaseOrder) {
            return new NextResponse('Purchase order not found', { status: 404 });
        }

        await db.purchaseOrder.delete({
            where: {
                id
            }
        });

        return new NextResponse(`Purchase order with id ${id} deleted`, { status: 200 });
    } catch (error) {
        console.error('[PURCHASE ORDER DELETE] ', error)
        return new NextResponse('Internal Error', { status: 500 });
    }
}