import {NextRequest, NextResponse} from "next/server";
import {db} from "@/lib/db";
import {slugifyName} from "@/lib/utils";

export async function GET() {
    try {
        const categories = await db.categories.findMany({
            orderBy: {
                name: 'asc'
            }
        });

        return NextResponse.json(categories, { status: 200 });
    } catch (error) {
        if (error instanceof Error) {
            console.error('[CATEGORIES] ', error.message)
        }
        return new NextResponse('Internal Error', { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const { name } = await req.json();

    if (!name) return new NextResponse("Missing required fields", { status: 400});

    const slug = slugifyName(name);

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