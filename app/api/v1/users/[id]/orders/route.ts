import {NextRequest, NextResponse} from "next/server";
import {auth, clerkClient} from "@clerk/nextjs/server";
import {db} from "@/lib/db";

export async function GET(req: NextRequest, ctx: RouteContext<'/api/v1/users/[id]/orders'>) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized", statusCode: 401 }, { status: 401 });
        }

        const { id } = await ctx.params;
        const client = await clerkClient()

        const user = await client.users.getUser(id)

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            )
        }

        const [orders, totalOrders] = await db.$transaction([
            db.purchaseOrder.findMany({ where: { userId: id }, include: { product: true } }),
            db.purchaseOrder.count({ where: { userId: id } }),
        ])

        return NextResponse.json({data: orders, count: totalOrders}, { status: 200 })
    } catch(err) {
        if (err instanceof Error) {
            console.error(`[USER ORDERS ERROR] ${err.message}`);
            return new NextResponse(`[USER ORDERS ERROR] ${err.message}`, { status: 500 });
        }
    }
}