import {NextRequest, NextResponse} from "next/server";
import {db} from "@/lib/db";
import {slugifyName} from "@/lib/utils";

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const filterByName = searchParams.get('name');
        const filterByCategory = searchParams.get('category');
        const filterByItemsPerPage = searchParams.get('itemsPerPage');

        if (filterByName) {
            const productByName = await db.products.findMany({
                where: {
                    name: {
                        contains: filterByName,
                        mode: 'insensitive'
                    }
                },
                include: {
                    category: true,
                    Stocks: true,
                    Brands: true
                }
            })

            return NextResponse.json(productByName, { status: 200 });
        }

        if (filterByCategory) {
            const productByCategory = await db.products.findMany({
                where: {
                    category: {
                        name: {
                            contains: filterByCategory,
                            mode: 'insensitive'
                        }
                    }
                },
                include: {
                    category: true,
                    Stocks: true,
                    Brands: true
                }
            })

            return NextResponse.json(productByCategory, { status: 200 });
        }

        if (filterByItemsPerPage) {
            const itemsPerPage = parseInt(filterByItemsPerPage, 10);
            if (isNaN(itemsPerPage) || itemsPerPage <= 0) {
                return new NextResponse("Invalid itemsPerPage parameter", { status: 400 });
            }

            const productsByItemsPerPage = await db.products.findMany({
                take: itemsPerPage,
                include: {
                    category: true,
                    Stocks: true,
                    Brands: true
                },
            })

            return NextResponse.json(productsByItemsPerPage, { status: 200 });
        }

        const products = await db.products.findMany({
            include: {
                category: true,
                Stocks: true,
                Brands: true
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
    const { name, price, categoryId } = await req.json();

    if (!name || !price || !categoryId) return new NextResponse("Missing required fields", { status: 400});

    const slug = slugifyName(name)

    const existingProduct = await db.products.findUnique({
        where: { slug }
    })

    if (existingProduct) {
        return new NextResponse("Product already exists", { status: 400 });
    }

    try {
        const product = await db.products.create({
            data: {
                name,
                slug,
                price,
                categoryId
            }
        })

        return NextResponse.json(product);
    } catch (error) {
        if (error instanceof Error) {
            console.error('[PRODUCTS] ', error.message)
        }
        return new NextResponse("Internal Error", { status: 500 });
    }
}

