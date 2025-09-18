import {NextRequest, NextResponse} from "next/server";
import {db} from "@/lib/db";
import slugify from "slugify";

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const searchByName = searchParams.get('name');
        const searchByCategory = searchParams.get('category');
        const searchByItemsPerPage = searchParams.get('itemsPerPage');

        if (searchByName) {
            const productByName = await db.products.findMany({
                where: {
                    name: {
                        contains: searchByName,
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

        if (searchByCategory) {
            const productByCategory = await db.products.findMany({
                where: {
                    category: {
                        name: {
                            contains: searchByCategory,
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

        if (searchByItemsPerPage) {
            const itemsPerPage = parseInt(searchByItemsPerPage, 10);
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

        return NextResponse.json(products, { status: 200, statusText: 'OK' });
    } catch (error) {
        console.error('[PRODUCTS] ', error)
        return new NextResponse('Internal Error', { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const { name, price, categoryId } = await req.json();

    if (!name || !price || !categoryId) return new NextResponse("Missing required fields", { status: 400});

    const slug = slugify(name, {
        lower: true,      // Convertir en minuscules
        strict: true,     // Supprimer tous les caractères spéciaux
        locale: 'fr'      // Support spécifique pour le français
    });

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

