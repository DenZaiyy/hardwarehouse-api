import {NextRequest, NextResponse} from "next/server";
import {auth, clerkClient} from "@clerk/nextjs/server";

export async function GET() {
    try {
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
        const { username, email, password, firstname, lastname } = await req.json()
        const { userId, sessionClaims } = await auth()
        const client = await clerkClient();

        if (userId && sessionClaims) {
            const { privateMetadata } = sessionClaims;
            console.log(privateMetadata)
        }

        if (!username && !email && !firstname && !lastname) return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400 })

        const createdUser = await client.users.createUser({
            username: username,
            password: password,
            firstName: firstname,
            lastName: lastname,
            emailAddress: email,
            passwordHasher: "bcrypt"
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
            return new NextResponse(`[USERS] Une erreur est survenue lors de la création d'un utilisateur : ${err.message}`, { status: 500 });
        }
    }
}