import {clerkMiddleware, createRouteMatcher} from "@clerk/nextjs/server";
import {NextResponse} from "next/server";

const isProtectedRoute = createRouteMatcher(["/admin(.*)"]);
const isAdminRoute = createRouteMatcher(["/admin/users(.*)", "/admin/transactions(.*)"]);
const isProtectedApiRoute = createRouteMatcher(["/api/protected(.*)", "/api/admin(.*)"]);
const isPublicApiRoute = createRouteMatcher(["/api/public(.*)", "/api/webhooks(.*)"]);

export default clerkMiddleware(async (auth, req) => {
    const { userId, sessionClaims } = await auth();

    // Require login for all protected routes
    if (isProtectedRoute(req)) {
        if (!userId) return (await auth()).redirectToSignIn();
    }

    // Require admin role for specific routes
    if (isAdminRoute(req)) {
        if (!userId) return (await auth()).redirectToSignIn();

        const userRole = sessionClaims?.publicMetadata?.role;
        if (userRole !== "admin") {
            return new Response("Unauthorized", { status: 401 });
        }
    }

    // Protection des routes API
    if (isProtectedApiRoute(req) && !isPublicApiRoute(req)) {
        if (!userId) {
            return NextResponse.json(
                { error: "Unauthorized - No valid token" },
                { status: 401 }
            );
        }

        // Si c'est une route API admin, vérifier le rôle
        if (req.nextUrl.pathname.startsWith("/api/admin")) {
            const userRole = sessionClaims?.publicMetadata?.role;
            if (userRole !== "admin") {
                return NextResponse.json(
                    { error: "Forbidden - Admin access required" },
                    { status: 403 }
                );
            }
        }
    }
});

export const config = {
    matcher: [
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        "/(api|trpc)(.*)",
    ],
};