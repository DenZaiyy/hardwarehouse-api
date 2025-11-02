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

        const brands = await db.brands.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });

        const res = NextResponse.json(brands, { status: 200 });
        res.headers.set('X-RateLimit-Remaining', remaining.toString());
        res.headers.set('X-RateLimit-Reset', reset.toString());

        return res;
    } catch (error) {
        if (error instanceof Error) {
            console.error('[BRANDS] ', error.message)
            return NextResponse.json(
                { error: `[BRANDS] Erreur interne : ${error ? error.message : 'Erreur inconnue'}` },
                { status: 500 }
            );
        }
    }
}

export async function POST(req: NextRequest) {
    const { name } = await req.json();

    if (!name) return new NextResponse("Missing required fields", { status: 400});

    const slug = slugifyName(name)

    const existingBrand = await db.brands.findUnique({
        where: { slug }
    });

    if (existingBrand) {
        return NextResponse.json(
            { error: `La marque existe déjà` },
            { status: 400 }
        );
    }

    try {
        const brand = await db.brands.create({
            data: {
                name: name,
                slug: slug
            }
        })

        return NextResponse.json(brand, { status: 201 });
    } catch (error) {
        if (error instanceof Error) {
            console.error('[BRAND] ', error.message)
            return NextResponse.json(
                { error: `[BRAND] Erreur interne : ${error ? error.message : 'Erreur inconnue'}` },
                { status: 500 }
            );
        }
    }
}