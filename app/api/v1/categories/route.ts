import {NextRequest, NextResponse} from "next/server";
import {db} from "@/lib/db";
import {rateLimiter, slugifyName} from "@/lib/utils";
import {auth} from "@clerk/nextjs/server";
import {buildCategoryWhere, parseFilters} from "@/lib/api/filters";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = req.nextUrl;
        const filters = parseFilters(searchParams);
        const where = buildCategoryWhere(filters);

        const categories = await db.categories.findMany({
            where,
            select: {
                id: true,
                name: true,
                slug: true,
                logo: true,
                active: true,
                createdAt: true,
                updatedAt: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(categories, {status: 200});
    } catch (error) {
        if (error instanceof Error) {
            console.error('[CATEGORIES] ', error.message)
            return NextResponse.json(
                { error: `[CATEGORIES] Erreur interne : ${error ? error.message : 'Erreur inconnue'}` },
                { status: 500 }
            );
        }
    }
}

export async function POST(req: NextRequest) {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized", statusCode: 401 }, { status: 401 });
    }

    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
    const { success } = await rateLimiter.limit(ip);

    if (!success) {
        return NextResponse.json({ error: "Trop de demandes" }, { status: 429 });
    }

    try {
        // Accepter JSON au lieu de FormData
        const body = await req.json();
        const { name, active = true } = body;

        if (!name || typeof name !== 'string') {
            return NextResponse.json({ error: "Le nom est requis" }, { status: 400 });
        }

        const slug = slugifyName(name);

        const result = await db.$transaction(async (tx) => {
            // Check if category exists
            const existingCategory = await tx.categories.findUnique({
                where: { slug },
                select: { id: true }
            });

            if (existingCategory) throw new Error("CATEGORY_EXISTS")

            // Create category
            const category = await tx.categories.create({
                data: {
                    name: name,
                    active: Boolean(active),
                    slug: slug
                },
                select: {
                    id: true,
                    name: true,
                    active: true,
                    slug: true,
                    logo: true,
                    createdAt: true
                }
            });

            return category;
        });

        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        if (error instanceof Error) {
            console.error('[CATEGORY] ', error.message)
            
            if (error.message === "CATEGORY_EXISTS") {
                return NextResponse.json({ error: "La catégorie existe déjà" }, { status: 400 });
            }
            
            return NextResponse.json(
                { error: `[CATEGORY] Erreur interne : ${error.message}` },
                { status: 500 }
            );
        }
    }
}