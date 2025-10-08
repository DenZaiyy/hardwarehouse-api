import {NextRequest, NextResponse} from "next/server";
import {db} from "@/lib/db";
import {slugifyName} from "@/lib/utils";

export async function GET() {
    try {
        const products = await db.products.findMany({
            include: {
                category: true,
                stocks: true,
                brand: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(products, { status: 200 });
    } catch (error) {
        if (error instanceof Error) {
            console.error('[PRODUCTS] ', error.message)
        }
        return new NextResponse('Internal Error', { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const { name, price, categoryId, brandId } = await req.json();

    if (!name || !price || !categoryId || !brandId) return new NextResponse("Missing required fields", { status: 400});

    const slug = slugifyName(name)

    const existingProduct = await db.products.findUnique({
        where: { slug }
    })

    if (existingProduct) {
        return new NextResponse("Product already exists", { status: 400 });
    }

    const existingCategory = await db.categories.findMany({
        where: { id: categoryId }
    })

    if (!existingCategory) {
        return new NextResponse('Category not exists', { status: 400 });
    }

    const existingBrand = await db.brands.findUnique({
        where: { id: brandId }
    })

    if (!existingBrand) {
        return new NextResponse('Brand not exists', { status: 404 });
    }

    try {
        const product = await db.products.create({
            include: {
                category: true,
                brand:  true
            },
            data: {
                name: name,
                slug: slug,
                price: price,
                image: "",
                category: {
                    connect: { id: categoryId }
                },
                brand: {
                    connect: { id: brandId }
                }
            }
        })

        return NextResponse.json({
            product,
            redirect: `/admin/products/${product.id}`
        });
    } catch (error) {
        if (error instanceof Error) {
            console.error('[PRODUCTS] ', error.message)
        }
        return new NextResponse("Internal Error", { status: 500 });
    }
}

