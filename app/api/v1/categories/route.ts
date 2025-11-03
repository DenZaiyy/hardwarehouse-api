import {NextRequest, NextResponse} from "next/server";
import {db} from "@/lib/db";
import {rateLimiter, slugifyName} from "@/lib/utils";

export async function GET(req: NextRequest) {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';

    try {
        const { success, remaining, reset } = await rateLimiter.limit(ip);

        if (!success) {
            return NextResponse.json(
                { error: "Trop de demandes" },
                { status: 429 }
            );
        }

        const categories = await db.categories.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });

        const res = NextResponse.json(categories, { status: 200 });
        res.headers.set('X-RateLimit-Remaining', remaining.toString());
        res.headers.set('X-RateLimit-Reset', reset.toString());

        return res;
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
    const { name } = await req.json();

    if (!name) return NextResponse.json({ error: "Champs obligatoires manquants" }, { status: 400});

    const slug = slugifyName(name);

    const existingCategory = await db.categories.findUnique({
        where: { slug }
    });

    if (existingCategory) {
        return NextResponse.json({ error: "La catégorie existe déjà" }, { status: 400 });
    }

    try {
        const category = await db.categories.create({
            data: {
                name: name,
                slug: slug
            }
        })

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
            return NextResponse.json(
                { error: `[CATEGORIES] Erreur interne : ${error ? error.message : 'Erreur inconnue'}` },
                { status: 500 }
            );
        }
    }
}