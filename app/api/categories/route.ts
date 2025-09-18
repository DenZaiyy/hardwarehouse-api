import {NextRequest, NextResponse} from "next/server";
import {db} from "@/lib/db";
import slugify from "slugify";

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const filterByName = searchParams.get('name');

        if (filterByName) {
            const categoryByName = await db.categories.findMany({
                where: {
                    name: {
                        contains: filterByName,
                        mode: 'insensitive'
                    }
                }
            })

            return NextResponse.json(categoryByName, { status: 200 });
        }

        const categories = await db.categories.findMany();

        return NextResponse.json(categories, { status: 200 });
    } catch (error) {
        console.error('[CATEGORIES] ', error)
        return new NextResponse('Internal Error', { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const { name } = await req.json();

    if (!name) return new NextResponse("Missing required fields", { status: 400});

    const slug = slugify(name, {
        lower: true,      // Convertir en minuscules
        strict: true,     // Supprimer tous les caractères spéciaux
        locale: 'fr'      // Support spécifique pour le français
    });

    const existingCategory = await db.categories.findUnique({
        where: { slug }
    });

    if (existingCategory) {
        return new NextResponse("Category already exists", { status: 400 });
    }

    try {
        const category = await db.categories.create({
            data: {
                name: name,
                slug: slug
            }
        })

        return NextResponse.json(category, { status: 201, statusText: 'Created' });
    } catch (error) {
        if (error instanceof Error) {
            console.error('[CATEGORIES] ', error.message)
        }
        return new NextResponse("Internal Error", { status: 500 });
    }
}

