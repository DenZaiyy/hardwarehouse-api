import {NextRequest, NextResponse} from "next/server";
import {clerkClient} from "@clerk/nextjs/server";
import {db} from "@/lib/db";

export async function GET(req: NextRequest, ctx: RouteContext<'/api/users/[id]/orders'>) {
    try {
        const { id } = await ctx.params;
        const client = await clerkClient()

        const user = await client.users.getUser(id)

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            )
        }

        const orders = await db.purchaseOrder.findMany({
            where: {
                userId: id
            },
            include: {
                product: true
            }
        })

        return NextResponse.json(orders, { status: 200 })
    } catch(err) {
        if (err instanceof Error) {
            console.error(`[USER ORDERS ERROR] ${err.message}`);
            return new NextResponse(`[USER ORDERS ERROR] ${err.message}`, { status: 500 });
        }
    }
}