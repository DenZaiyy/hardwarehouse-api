import {NextRequest, NextResponse} from "next/server";
import {auth, clerkClient} from "@clerk/nextjs/server";

export async function GET() {
    try {
        const { userId, sessionClaims } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized", statusCode: 401 }, { status: 401 });
        }

        // Check if user has admin role
        const userRole = sessionClaims?.publicMetadata?.role;
        if (userRole !== "admin") {
            return NextResponse.json({ error: "Forbidden - Admin access required", statusCode: 403 }, { status: 403 });
        }

        const client = await clerkClient();
        const users = await client.users.getUserList()

        return NextResponse.json(users.data);
    } catch(error) {
        if (error instanceof  Error) {
            console.error(error.message);
            return NextResponse.json({ error: "[USERS] Une erreur est survenue lors de la récupération d'utilisateurs" })
        }
    }
}

export async function POST(req: NextRequest) {
    try {
        const { userId, sessionClaims } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized", statusCode: 401 }, { status: 401 });
        }

        // Check if user has admin role
        const userRole = sessionClaims?.publicMetadata?.role;
        if (userRole !== "admin") {
            return NextResponse.json({ error: "Forbidden - Admin access required", statusCode: 403 }, { status: 403 });
        }

        const { username, email, password, passwordConfirm, firstname, lastname, isAdmin } = await req.json()
        const client = await clerkClient()

        if (!username && !email && !password && !passwordConfirm && !firstname && !lastname) return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 })

        const createdUser = await client.users.createUser({
            firstName: firstname,
            lastName: lastname,
            username: username,
            emailAddress: [email],
            password: password,
            publicMetadata: {
                'role': isAdmin ? 'admin' : 'employee'
            }
        })

        if (!createdUser) {
            return NextResponse.json({
                error: "L'utilisateur n'a pas été crée"
            }, { status: 500 })
        }

        return NextResponse.json(createdUser)
    } catch(err) {
        if (err instanceof Error) {
            console.error(err.message);
            return new NextResponse(`[USERS] Une erreur est survenue lors de la création d'un utilisateur : ${err}`, { status: 500 });
        }
    }
}