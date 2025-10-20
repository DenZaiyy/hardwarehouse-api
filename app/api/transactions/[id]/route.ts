import {NextRequest, NextResponse} from "next/server";
import {rateLimiter} from "@/lib/utils";
import {db} from "@/lib/db";

export async function GET(_req: NextRequest, ctx: RouteContext<'/api/transactions/[id]'>) {
    try {
        const { id } = await ctx.params;
        const ip = _req.headers.get('x-forwarded-for') || _req.headers.get('x-real-ip') || '127.0.0.1';
        const { success, remaining, reset } = await rateLimiter.limit(ip);

        if (!success) {
            return NextResponse.json(
                { error: "Trop de demandes" },
                { status: 429 }
            );
        }

        const transaction = await db.transactions.findUnique({
            where: {
                id: id
            },
            include: {
                product: true,
            }
        });

        if (!transaction) {
            return new NextResponse('Transaction not found', { status: 404 });
        }

        const res = NextResponse.json(transaction, { status: 200 });
        res.headers.set('X-RateLimit-Remaining', remaining.toString());
        res.headers.set('X-RateLimit-Reset', reset.toString());

        return res;
    } catch (error) {
        console.error('[TRANSACTION] ', error)
        return new NextResponse('Internal Error', { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<'/api/transactions/[id]'>) {
    try {
        const { id } = await ctx.params;
        const transaction = await db.transactions.findUnique({
            where: {
                id
            }
        });

        if (!transaction) {
            return new NextResponse('Transaction not found', { status: 404 });
        }

        await db.transactions.delete({
            where: {
                id
            }
        });

        return new NextResponse(`Transaction with id ${id} deleted`, { status: 200 });
    } catch (error) {
        console.error('[TRANSACTION DELETE] ', error)
        return new NextResponse('Internal Error', { status: 500 });
    }
}