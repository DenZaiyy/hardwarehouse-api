import {NextResponse} from "next/server";
import {auth} from "@clerk/nextjs/server";

type RoleCheckResult =
    | { userId: string; response: null }
    | { userId: null; response: NextResponse };

export async function requireAuth(): Promise<RoleCheckResult> {
    const { userId } = await auth();

    if (!userId) {
        return {
            userId: null,
            response: NextResponse.json({ error: "Unauthorized", statusCode: 401 }, { status: 401 }),
        };
    }

    return { userId, response: null };
}

// Le rôle vient de sessionClaims.publicMetadata.role, alimenté par le Session
// Token customisé dans le Dashboard Clerk (Configure > Sessions) — sans ça,
// ce check échoue toujours (fail-closed), même pour un vrai admin.
export async function requireAdmin(): Promise<RoleCheckResult> {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
        return {
            userId: null,
            response: NextResponse.json({ error: "Unauthorized", statusCode: 401 }, { status: 401 }),
        };
    }

    if (sessionClaims?.publicMetadata?.role !== "admin") {
        return {
            userId: null,
            response: NextResponse.json(
                { error: "Accès réservé aux administrateurs", statusCode: 403 },
                { status: 403 }
            ),
        };
    }

    return { userId, response: null };
}
