import {NextRequest, NextResponse} from "next/server";
import {db} from "@/lib/db";
import {requireAdmin} from "@/lib/auth/require-role";
import {handleApiError} from "@/lib/api/handle-api-error";
import {NotFoundError} from "@/lib/api/errors";

export async function GET(_req: NextRequest, ctx: RouteContext<'/api/v1/transactions/[id]'>) {
    const { response } = await requireAdmin();
    if (response) return response;

    try {
        const { id } = await ctx.params;

        const transaction = await db.transactions.findUnique({
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

        if (!transaction) throw new NotFoundError("Transaction");

        return NextResponse.json(transaction, { status: 200 });
    } catch (error) {
        return handleApiError("TRANSACTION GET", error);
    }
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<'/api/v1/transactions/[id]'>) {
    const { response } = await requireAdmin();
    if (response) return response;

    try {
        const { id } = await ctx.params;
        const transaction = await db.transactions.findUnique({
            where: {
                id
            }
        });

        if (!transaction) throw new NotFoundError("Transaction");

        await db.transactions.delete({
            where: {
                id
            }
        });

        return new NextResponse(`Transaction with id ${id} deleted`, { status: 200 });
    } catch (error) {
        return handleApiError("TRANSACTION DELETE", error);
    }
}