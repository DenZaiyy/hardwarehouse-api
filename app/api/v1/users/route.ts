import {NextRequest, NextResponse} from "next/server";
import {clerkClient} from "@clerk/nextjs/server";
import {requireAdmin} from "@/lib/auth/require-role";
import {handleApiError} from "@/lib/api/handle-api-error";
import {userSchema} from "@/lib/validators/userSchema";

export async function GET() {
    const { response } = await requireAdmin();
    if (response) return response;

    try {
        const client = await clerkClient();
        const users = await client.users.getUserList()

        return NextResponse.json({
            data: users.data,
            total: users.totalCount
        }, { status: 200 });
    } catch(error) {
        return handleApiError("USERS GET", error);
    }
}

export async function POST(req: NextRequest) {
    const { response } = await requireAdmin();
    if (response) return response;

    try {
        const { username, email, password, firstName, lastName, isAdmin } = userSchema.parse(await req.json());
        const client = await clerkClient()

        const createdUser = await client.users.createUser({
            firstName,
            lastName,
            username,
            emailAddress: [email],
            password,
            publicMetadata: {
                'role': isAdmin ? 'admin' : 'employee'
            }
        })

        return NextResponse.json(createdUser, { status: 201 });
    } catch(error) {
        return handleApiError("USERS POST", error);
    }
}