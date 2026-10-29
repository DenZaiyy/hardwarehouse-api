import {clerkMiddleware, createRouteMatcher} from "@clerk/nextjs/server";
import {NextResponse} from "next/server";
import {isAdminRole, isStaffRole} from "@/lib/auth/roles";

// Pages du back-office : réservées à l'équipe (employé ou administrateur), et à l'administrateur seul pour les
// comptes, les mouvements de stock et les bons de commande, comme les routes d'API qu'elles appellent.
// Un compte connecté sans rôle n'entre nulle part.
const isProtectedRoute = createRouteMatcher(["/admin(.*)"]);
const isAdminRoute = createRouteMatcher(["/admin/users(.*)", "/admin/transactions(.*)", "/admin/purchase-orders(.*)"]);

export default clerkMiddleware(async (auth, req) => {
    if (!isProtectedRoute(req)) return NextResponse.next();

    const { userId, sessionClaims, redirectToSignIn } = await auth();
    if (!userId) return redirectToSignIn();

    const role = sessionClaims?.publicMetadata?.role;
    if (!isStaffRole(role)) {
        return new NextResponse("Accès réservé à l'équipe du back-office", { status: 403 });
    }
    if (isAdminRoute(req) && !isAdminRole(role)) {
        return new NextResponse("Accès réservé aux administrateurs", { status: 403 });
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        "/(api|trpc)(.*)",
    ],
};
