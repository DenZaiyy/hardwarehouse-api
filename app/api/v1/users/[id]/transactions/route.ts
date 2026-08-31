import {NextRequest, NextResponse} from "next/server";
import {clerkClient} from "@clerk/nextjs/server";
import {db} from "@/lib/db";
import {requireAdmin} from "@/lib/auth/require-role";
import {handleApiError} from "@/lib/api/handle-api-error";
import {NotFoundError} from "@/lib/api/errors";

export async function GET(req: NextRequest, ctx: RouteContext<'/api/v1/users/[id]/transactions'>) {
    const { response } = await requireAdmin();
    if (response) return response;

    try {
        const { id } = await ctx.params;
        const client = await clerkClient()

        const user = await client.users.getUser(id)

        if (!user) throw new NotFoundError("Utilisateur");

        // 🚀 OPTIMIZATION 8: Selective fields in transaction query (FIXED)
        // Use select instead of include to reduce data transfer
        const [transactions, totalTransactions] = await db.$transaction([
            db.transactions.findMany({
                where: { userId: id },
                select: {
                    id: true,
                    type: true,        // Boolean field
                    oldQtt: true,      // Correct field name
                    newQtt: true,      // Correct field name
                    userFullName: true,
                    createdAt: true,   // Only field that exists, no updatedAt
                    product: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                            price: true,
                            thumbnail: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            }),
            db.transactions.count({ where: { userId: id } }),
        ])

        return NextResponse.json({ data: transactions, count: totalTransactions }, { status: 200 })
    } catch(error) {
        return handleApiError("USER TRANSACTIONS", error);
    }
}