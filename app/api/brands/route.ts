import {NextRequest, NextResponse} from "next/server";
import {db} from "@/lib/db";
import {slugifyName} from "@/lib/utils";

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const filterByName = searchParams.get('name');

        if (filterByName) {
            const brandsByName = await db.brands.findMany({
                where: {
                    name: {
                        contains: filterByName,
                        mode: 'insensitive'
                    }
                }
            })

            return NextResponse.json(brandsByName, { status: 200 });
        }

        const brands = await db.brands.findMany();

        return NextResponse.json(brands, { status: 200 })
    } catch (error) {
        if (error instanceof Error) {
            console.error('[BRANDS] ', error.message)
            return new NextResponse('Internal Error: ' + error.message, { status: 500, statusText: error.message });
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
        return new NextResponse("Brand already exists", { status: 400 });
    }

    try {
        const brand = await db.brands.create({
            data: {
                name: name,
                slug: slug
            }
        })

        return NextResponse.json(brand, { status: 201, statusText: 'Created' });
    } catch (error) {
        if (error instanceof Error) {
            console.error('[BRAND] ', error.message)
            return new NextResponse('Internal Error: ' + error.message, { status: 500, statusText: error.message });
        }
    }
}