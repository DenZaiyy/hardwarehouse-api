import {NextRequest, NextResponse} from "next/server";
import {db} from "@/lib/db";
import {rateLimiter, slugifyName} from "@/lib/utils";
import {auth} from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
    try {
        const categories = await db.categories.findMany({
            select: {
                id: true,
                name: true,
                slug: true,
                logo: true,
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

    // 🚀 OPTIMIZATION #10: Add rate limiting to POST
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
    const { success } = await rateLimiter.limit(ip);

    if (!success) {
        return NextResponse.json({ error: "Trop de demandes" }, { status: 429 });
    }

    const { name, logo } = await req.json();

    // 🚀 OPTIMIZATION #11: Fix validation logic (name is required)
    if (!name) return NextResponse.json({ error: "Le nom est obligatoire" }, { status: 400});

    const slug = slugifyName(name);

    try {
        // 🚀 OPTIMIZATION #12: Use transaction for validation + creation
        const category = await db.$transaction(async (tx) => {
            // Check if category exists
            const existingCategory = await tx.categories.findUnique({
                where: { slug },
                select: { id: true }
            });

            if (existingCategory) {
                throw new Error("CATEGORY_EXISTS");
            }

            // Create category
            return await tx.categories.create({
                data: {
                    name: name,
                    slug: slug,
                    logo: logo
                },
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    logo: true,
                    createdAt: true
                }
            });
        });

        return NextResponse.json(
            {
                category,
                redirect: `/admin/categories/${category.id}`
            },
            { status: 201 }
        );
    } catch (error) {
        if (error instanceof Error) {
            console.error('[CATEGORIES] ', error.message)
            
            if (error.message === "CATEGORY_EXISTS") {
                return NextResponse.json({ error: "La catégorie existe déjà" }, { status: 400 });
            }
            
            return NextResponse.json(
                { error: `[CATEGORIES] Erreur interne : ${error.message}` },
                { status: 500 }
            );
        }
    }
}