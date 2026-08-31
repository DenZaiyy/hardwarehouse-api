import {NextRequest, NextResponse} from "next/server";
import {db} from "@/lib/db";
import {requireAdmin} from "@/lib/auth/require-role";
import {handleApiError} from "@/lib/api/handle-api-error";
import {NotFoundError} from "@/lib/api/errors";

export async function GET(_req: NextRequest, ctx: RouteContext<'/api/v1/purchase-orders/[id]'>) {
    const { response } = await requireAdmin();
    if (response) return response;

    try {
        const { id } = await ctx.params;

        const purchaseOrder = await db.purchaseOrder.findUnique({
            where: {
                id: id
            },
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        slug: true,
                        price: true,
                        thumbnail: true
                    }
                },
            }
        });

        if (!purchaseOrder) throw new NotFoundError("Bon de commande");

        return NextResponse.json(purchaseOrder, {status: 200});
    } catch (error) {
        return handleApiError("PURCHASE ORDER GET", error);
    }
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<'/api/v1/purchase-orders/[id]'>) {
    const { response } = await requireAdmin();
    if (response) return response;

    try {
        const { id } = await ctx.params;
        const purchaseOrder = await db.purchaseOrder.findUnique({
            where: {
                id
            }
        });

        if (!purchaseOrder) throw new NotFoundError("Bon de commande");

        await db.purchaseOrder.delete({
            where: {
                id
            }
        });

        return new NextResponse(`Purchase order with id ${id} deleted`, { status: 200 });
    } catch (error) {
        return handleApiError("PURCHASE ORDER DELETE", error);
    }
}