import {NextRequest, NextResponse} from "next/server";
import {db} from "@/lib/db";
import {rateLimiter, slugifyName} from "@/lib/utils";
import {auth} from "@clerk/nextjs/server";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_req: NextRequest) {
    try {
        const brands = await db.brands.findMany({
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

        return NextResponse.json(brands, {status: 200});
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
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized", statusCode: 401 }, { status: 401 });
    }

    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
    const { success } = await rateLimiter.limit(ip);

    if (!success) {
        return NextResponse.json({ error: "Trop de demandes" }, { status: 429 });
    }

    const { name, logo } = await req.json();

    if (!name) return NextResponse.json({ error: "Le nom est obligatoire" }, { status: 400});

    const slug = slugifyName(name);

    try {
        const brand = await db.$transaction(async (tx) => {
            // Check if brand exists
            const existingBrand = await tx.brands.findUnique({
                where: { slug },
                select: { id: true }
            });

            if (existingBrand) {
                throw new Error("BRAND_EXISTS");
            }

            // Create brand
            return await tx.brands.create({
                data: {
                    name: name,
                    logo: logo,
                    slug: slug
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
                brand,
                redirect: `/admin/brands/${brand.id}`
            },
            { status: 201 }
        );
    } catch (error) {
        if (error instanceof Error) {
            console.error('[BRAND] ', error.message)
            
            if (error.message === "BRAND_EXISTS") {
                return NextResponse.json({ error: "La marque existe déjà" }, { status: 400 });
            }
            
            return NextResponse.json(
                { error: `[BRAND] Erreur interne : ${error.message}` },
                { status: 500 }
            );
        }
    }
}