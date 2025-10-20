import {NextRequest, NextResponse} from "next/server";
import {clerkClient} from "@clerk/nextjs/server";
import {db} from "@/lib/db";

export async function GET(req: NextRequest, ctx: RouteContext<'/api/users/[id]'>) {
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

        return NextResponse.json(user)
    } catch(err) {
        if (err instanceof Error) {
            console.error(`[USER ERROR] ${err.message}`);
            return new NextResponse(`[USER ERROR] ${err.message}`, { status: 500 });
        }
    }
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<'/api/users/[id]'>) {
    try {
        const { id } = await ctx.params;
        const client = await clerkClient()

        // check if userId exists in clerk
        const user = await client.users.getUser(id)

        if (!user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 }
            )
        }

        //check and anonymize userdata in db
        await db.transactions.updateMany({
            where: {
                userId: user.id
            },
            data: {
                userId: undefined,
                userFullName: "Utilisateur supprimé"
            }
        })

        await db.purchaseOrder.updateMany({
            where: {
                userId: user.id
            },
            data: {
                userId: undefined,
                userFullName: "Utilisateur supprimé"
            }
        })

        await client.users.deleteUser(id)

        return new NextResponse(`User with id ${id} deleted and anonymized`, { status: 200 });
    } catch (error) {
        console.error('[USER DELETE] ', error)
        return new NextResponse('Internal Error', { status: 500 });
    }
}