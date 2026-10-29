import {NextResponse} from "next/server";
import {auth} from "@clerk/nextjs/server";
import {isAdminRole, isStaffRole} from "@/lib/auth/roles";

type RoleCheckResult =
    | { userId: string; response: null }
    | { userId: null; response: NextResponse };

// Le rôle vient de sessionClaims.publicMetadata.role, alimenté par le Session
// Token customisé dans le Dashboard Clerk (Configure > Sessions) — sans ça,
// ces checks échouent toujours (fail-closed), même pour un vrai admin.
async function requireRole(allowed: (role: unknown) => boolean, forbidden: string): Promise<RoleCheckResult> {
    const { userId, sessionClaims } = await auth();

    if (!userId) {
        return {
            userId: null,
            response: NextResponse.json({ error: "Unauthorized", statusCode: 401 }, { status: 401 }),
        };
    }

    if (!allowed(sessionClaims?.publicMetadata?.role)) {
        return {
            userId: null,
            response: NextResponse.json({ error: forbidden, statusCode: 403 }, { status: 403 }),
        };
    }

    return { userId, response: null };
}

// Catalogue, stocks, remises, images et statistiques : employé ou administrateur
export async function requireStaff(): Promise<RoleCheckResult> {
    return requireRole(isStaffRole, "Accès réservé à l'équipe du back-office");
}

// Comptes, mouvements de stock et bons de commande : administrateur seulement
export async function requireAdmin(): Promise<RoleCheckResult> {
    return requireRole(isAdminRole, "Accès réservé aux administrateurs");
}
