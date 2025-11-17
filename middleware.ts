import {clerkMiddleware, createRouteMatcher} from "@clerk/nextjs/server";
import {NextResponse} from "next/server";

// Routes
const isProtectedRoute = createRouteMatcher(["/admin(.*)"]);
const isAdminRoute = createRouteMatcher(["/admin/users(.*)", "/admin/transactions(.*)"]);
const isApiRoute = createRouteMatcher(["/api(.*)"]);

export default clerkMiddleware(async (auth, req) => {
    const { userId, sessionClaims } = await auth();

    // Skip middleware checks for API routes - let them handle their own auth
    if (isApiRoute(req)) {
        return NextResponse.next();
    }

    // Require login for all protected routes
    if (isProtectedRoute(req)) {
        if (!userId) return (await auth()).redirectToSignIn();
    }

    // Require admin role for specific routes
    if (isAdminRoute(req)) {
        if (!userId) return (await auth()).redirectToSignIn();

        const userRole = sessionClaims?.publicMetadata?.role;
        if (userRole !== "admin") {
            return NextResponse.json("Unauthorized", { status: 401 });
        }
    }

    return NextResponse.next();
});

export const config = {
    matcher: [
        "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        "/(api|trpc)(.*)",
    ],
};