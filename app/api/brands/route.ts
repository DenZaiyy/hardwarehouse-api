import {NextRequest, NextResponse} from "next/server";
import {db} from "@/lib/db";
import {slugifyName} from "@/lib/utils";

export async function GET() {
    try {
        // Fetch brands with pagination
        const brands = await db.brands.findMany({
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(brands, { status: 200 });
    } catch (error) {
        if (error instanceof Error) {
            console.error('[BRANDS] ', error.message)
        }
        return new NextResponse('Internal Error', { status: 500 });
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
        return new NextResponse("Brand already exists", { status: 400, statusText: "Brand already exists" });
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
            return new NextResponse('Internal Error: ' + error.message, { status: 500, statusText: error.message });
        }
    }
}