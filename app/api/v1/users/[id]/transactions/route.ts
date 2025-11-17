import {NextRequest, NextResponse} from "next/server";
import {auth, clerkClient} from "@clerk/nextjs/server";
import {db} from "@/lib/db";

export async function GET(req: NextRequest, ctx: RouteContext<'/api/v1/users/[id]/transactions'>) {
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

        const [transactions, totalTransactions] = await db.$transaction([
            db.transactions.findMany({ where: { userId: id }, include: { product: true } }),
            db.transactions.count({ where: { userId: id } }),
        ])

        return NextResponse.json({ data: transactions, count: totalTransactions }, { status: 200 })
    } catch(err) {
        if (err instanceof Error) {
            console.error(`[USER TRANSACTIONS ERROR] ${err.message}`);
            return new NextResponse(`[USER TRANSACTIONS ERROR] ${err.message}`, { status: 500 });
        }
    }
}