import {NextRequest, NextResponse} from "next/server";
import {clerkClient} from "@clerk/nextjs/server";
import {db} from "@/lib/db";
import {requireAdmin} from "@/lib/auth/require-role";
import {handleApiError} from "@/lib/api/handle-api-error";
import {NotFoundError} from "@/lib/api/errors";

export async function GET(req: NextRequest, ctx: RouteContext<'/api/v1/users/[id]/orders'>) {
    const { response } = await requireAdmin();
    if (response) return response;

    try {
        const { id } = await ctx.params;
        const client = await clerkClient()

        const user = await client.users.getUser(id)

        if (!user) throw new NotFoundError("Utilisateur");

        const [orders, totalOrders] = await db.$transaction([
            db.purchaseOrder.findMany({
                where: { userId: id },
                include: {
                    product: {
                        select: { id: true, name: true, slug: true, price: true, thumbnail: true }
                    }
                },
                orderBy: { createdAt: "desc" }
            }),
            db.purchaseOrder.count({ where: { userId: id } }),
        ])

        return NextResponse.json({data: orders, count: totalOrders}, { status: 200 })
    } catch(error) {
        return handleApiError("USER ORDERS", error);
    }
}