import {NextRequest, NextResponse} from "next/server";
import {db} from "@/lib/db";
import {clientIp, rateLimiter} from "@/lib/rate-limit";
import {requireStaff} from "@/lib/auth/require-role";

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        // Rate limiting
        const ip = clientIp(req);
        const { success, remaining } = await rateLimiter.limit(ip);
        
        if (!success) {
            return NextResponse.json(
                { error: "Trop de demandes", data: null },
                { status: 429 }
            );
        }

        const { response } = await requireStaff();
        if (response) return response;

        const { slug } = await params;

        // Récupération de la catégorie pour vérifier son existence
        const category = await db.categories.findUnique({
            where: {
                slug: slug
            }
        });

        if (!category) {
            return NextResponse.json(
                { error: "Catégorie non trouvée", data: null },
                { status: 404 }
            );
        }

        // Récupération des attributs de la catégorie avec leur type et ordre
        const categoryAttributes = await db.categoryAttributes.findMany({
            where: {
                categoryId: category.id
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