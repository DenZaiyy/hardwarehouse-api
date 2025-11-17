import {NextRequest, NextResponse} from "next/server";
import {auth, clerkClient, currentUser} from "@clerk/nextjs/server";
import {db} from "@/lib/db";
import {rateLimiter} from "@/lib/utils";

interface UpdateUserData {
    username?: string;
    emailAddress?: string[];
    firstName?: string;
    lastName?: string;
    password?: string;
    locked?: boolean;
}

export async function GET(_req: NextRequest, ctx: RouteContext<'/api/v1/users/[id]'>) {
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

        return NextResponse.json(user)
    } catch(err) {
        if (err instanceof Error) {
            console.error(`[USER ERROR] ${err.message}`);
            return new NextResponse(`[USER ERROR] ${err.message}`, { status: 500 });
        }
    }
}

export async function PATCH(req: NextRequest, ctx: RouteContext<'/api/v1/users/[id]'>) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized", statusCode: 401 }, { status: 401 });
        }

        const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
        const { id } = await ctx.params;
        const { username, emailAddress, firstName, lastName, password, locked } = await req.json();

        console.log("Locked status: ", locked);

        // Vérifier qu'au moins un champ est fourni
        if (!username && !emailAddress && !firstName && !lastName && !password && locked === undefined) {
            return NextResponse.json("Au moins un champ est obligatoire.", { status: 400 });
        }

        const { success, remaining, reset } = await rateLimiter.limit(ip);

        if (!success) {
            return NextResponse.json(
                { error: "Trop de demandes" },
                { status: 429 }
            );
        }

        const updateData: UpdateUserData = {};
        const client = await clerkClient();
        const user = await client.users.getUser(id);

        if (!user) {
            return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
        }

        // Mettre à jour le pseudo seulement s'il change
        if (username && username !== user.username) {
            updateData.username = username;
        }

        // Mettre à jour l'email seulement si elle change
        if (emailAddress && emailAddress !== user.emailAddresses[0]?.emailAddress) {
            updateData.emailAddress = [emailAddress];
        }

        if (firstName && firstName !== user.firstName) {
            updateData.firstName = firstName;
        }

        if (lastName && lastName !== user.lastName) {
            updateData.lastName = lastName;
        }

        if (password) {
            updateData.password = password;
        }

        // Gérer le verrouillage/déverrouillage
        if (locked !== undefined && locked !== user.locked) {
            if (locked) {
                await client.users.lockUser(id);
            } else {
                await client.users.unlockUser(id);
            }
        }

        // Ne mettre à jour que si des changements sont présents
        let updatedUser = user;
        if (Object.keys(updateData).length > 0) {
            updatedUser = await client.users.updateUser(id, updateData);
        }

        const res = NextResponse.json(updatedUser, { status: 200 });
        res.headers.set('X-RateLimit-Remaining', remaining.toString());
        res.headers.set('X-RateLimit-Reset', reset.toString());

        return res;
    } catch(error) {
        if (error instanceof Error) {
            console.error('[USER PATCH] ', error.message);
            return NextResponse.json(
                { error: `[USER PATCH] Erreur interne : ${error.message}` },
                { status: 500 }
            );
        }
    }
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<'/api/v1/users/[id]'>) {
    try {
        const { userId, isAuthenticated } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized", statusCode: 401 }, { status: 401 });
        }

        const { id } = await ctx.params;
        const client = await clerkClient()

        // Protect the route by checking if the user is signed in
        if (!isAuthenticated) {
            return new NextResponse('Unauthorized', { status: 401 })
        }

        // Use `currentUser()` to get the Backend API User object
        const currUser = await currentUser()

        if (currUser && currUser.publicMetadata.role) {

        }

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
                userId: null,
                userFullName: "Utilisateur supprimé"
            }
        })

        await db.purchaseOrder.updateMany({
            where: {
                userId: user.id
            },
            data: {
                userId: null,
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