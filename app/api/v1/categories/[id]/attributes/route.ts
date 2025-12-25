import {NextRequest, NextResponse} from "next/server";
import {db} from "@/lib/db";
import {rateLimiter} from "@/lib/utils";
import { auth } from "@clerk/nextjs/server";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        // Rate limiting
        const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
        const { success, remaining } = await rateLimiter.limit(ip);
        
        if (!success) {
            return NextResponse.json(
                { error: "Trop de demandes", data: null },
                { status: 429 }
            );
        }

        // Authentication check for admin routes
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json(
                { error: "Non autorisé", data: null },
                { status: 401 }
            );
        }

        const { id: categoryId } = await params;

        // Récupération des attributs de la catégorie avec leur type et ordre
        const categoryAttributes = await db.categoryAttributes.findMany({
            where: {
                categoryId: categoryId
            },
            include: {
                attribute: true
            },
            orderBy: {
                displayOrder: 'asc'
            }
        });

        // Formatage des données pour le frontend
        const formattedAttributes = categoryAttributes.map(ca => ({
            id: ca.id,
            attributeId: ca.attributeId,
            name: ca.attribute.name,
            type: ca.attribute.type,
            required: ca.required,
            displayOrder: ca.displayOrder
        }));

        const res = NextResponse.json(formattedAttributes, { status: 200 });
        res.headers.set('X-RateLimit-Remaining', remaining.toString());
        return res;
        
    } catch (error) {
        console.error("Erreur lors de la récupération des attributs:", error);
        return NextResponse.json(
            { error: "Erreur serveur", data: null },
            { status: 500 }
        );
    }
}