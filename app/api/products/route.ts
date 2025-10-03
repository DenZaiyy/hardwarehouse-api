import {NextRequest, NextResponse} from "next/server";
import {db} from "@/lib/db";
import {slugifyName} from "@/lib/utils";
import {Prisma} from "@/app/generated/prisma/client";

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const filterByName = searchParams.get('name');
        const filterByCategory = searchParams.get('category');
        const filterByBrand = searchParams.get('brand');
        const filterByMinPrice = searchParams.get('minPrice');
        const filterByMaxPrice = searchParams.get('maxPrice');
        const filterByPage = searchParams.get('page');
        const filterByItemsPerPage = searchParams.get('itemsPerPage');

        // Build the where clause dynamically
        const whereClause: Prisma.ProductsWhereInput = {};
        const andConditions: Prisma.ProductsWhereInput[] = [];

        // Name filter
        if (filterByName) {
            andConditions.push({
                name: {
                    contains: filterByName,
                    mode: 'insensitive'
                }
            });
        }

        // Category filter (supports multiple categories separated by comma)
        if (filterByCategory) {
            const categoryIds = filterByCategory.split(',');
            andConditions.push({
                categoryId: {
                    in: categoryIds
                }
            });
        }

        // Brand filter (supports multiple brands separated by comma)
        if (filterByBrand) {
            const brandIds = filterByBrand.split(',');
            andConditions.push({
                brandId: {
                    in: brandIds
                }
            });
        }

        // Price range filter
        if (filterByMinPrice || filterByMaxPrice) {
            const priceCondition: {gte?: number, lte?: number} = {};
            if (filterByMinPrice) {
                const minPrice = parseFloat(filterByMinPrice);
                if (!isNaN(minPrice)) {
                    priceCondition.gte = minPrice;
                }
            }
            if (filterByMaxPrice) {
                const maxPrice = parseFloat(filterByMaxPrice);
                if (!isNaN(maxPrice)) {
                    priceCondition.lte = maxPrice;
                }
            }
            if (Object.keys(priceCondition).length > 0) {
                andConditions.push({
                    price: priceCondition
                });
            }
        }

        // Apply all conditions
        if (andConditions.length > 0) {
            whereClause.AND = andConditions;
        }

        // Pagination
        const page = filterByPage ? parseInt(filterByPage, 10) : 1;
        const itemsPerPage = filterByItemsPerPage ? parseInt(filterByItemsPerPage, 10) : undefined;

        let skip = 0;
        let take = undefined;

        if (itemsPerPage && !isNaN(itemsPerPage) && itemsPerPage > 0) {
            take = itemsPerPage;
            if (page && !isNaN(page) && page > 0) {
                skip = (page - 1) * itemsPerPage;
            }
        }

        const products = await db.products.findMany({
            where: whereClause,
            include: {
                category: true,
                stocks: true,
                brand: true
            },
            skip,
            take,
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

    if (!name || !price || !categoryId || brandId) return new NextResponse("Missing required fields", { status: 400});

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
                categoryId,
                brandId
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

