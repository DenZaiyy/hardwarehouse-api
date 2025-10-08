import {NextRequest, NextResponse} from "next/server";
import {db} from "@/lib/db";
import {slugifyName} from "@/lib/utils";

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const filterByPage = searchParams.get('page');
        const filterByItemsPerPage = searchParams.get('itemsPerPage');

        // Pagination
        const page = filterByPage ? Math.max(1, parseInt(filterByPage)) : 1;
        const itemsPerPage = filterByItemsPerPage ? Math.max(1, parseInt(filterByItemsPerPage)) : 10;
        const skip = (page - 1) * itemsPerPage;
        const take = itemsPerPage;

        // Fetch brands with pagination
        const brands = await db.brands.findMany({
            skip,
            take,
            orderBy: {
                name: 'asc'
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