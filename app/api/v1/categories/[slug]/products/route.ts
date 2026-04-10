import {NextRequest, NextResponse} from "next/server";
import {db} from "@/lib/db";
import {buildMeta, buildProductWhere, parseFilters, parsePagination, parseSort} from "@/lib/api/filters";

export async function GET(req: NextRequest, ctx: RouteContext<'/api/v1/categories/[slug]/products'>) {
    try {
        const { slug } = await ctx.params;
        const { searchParams } = req.nextUrl;

        const pagination = parsePagination(searchParams);
        const sort = parseSort(searchParams);
        const filters = parseFilters(searchParams);
        const where = buildProductWhere(filters, { category: { slug } });

        const [products, total] = await Promise.all([
            db.products.findMany({
                where,
                select: {
                    id: true,
                    name: true,
                    active: true,
                    sku: true,
                    mpn: true,
                    ean13: true,
                    promote: true,
                    discountPrice: true,
                    discountAmount: true,
                    slug: true,
                    price: true,
                    thumbnail: true,
                    shortDescription: true,
                    brand: {
                        select: {id: true, name: true, slug: true, active: true, _count: {select: {Products: true}}}
                    },
                    stock: {
                        select: { quantity: true }
                    }
                },
                orderBy: { [sort.sortBy]: sort.order },
                skip: pagination.skip,
                take: pagination.limit
            }),
            db.products.count({ where })
        ]);

        const formattedProducts = products.map((product) => ({
            id: product.id,
            name: product.name,
            active: product.active,
            sku: product.sku,
            mpn: product.mpn,
            ean13: product.ean13,
            promote: product.promote,
            discountPrice: product.discountPrice,
            discountAmount: product.discountAmount,
            slug: product.slug,
            price: product.price,
            thumbnail: product.thumbnail,
            shortDescription: product.shortDescription,
            brand: {
                id: product.brand.id,
                name: product.brand.name,
                slug: product.brand.slug,
                active: product.brand.active,
                productsCount: product.brand._count.Products,
            },
            stock: {
                quantity: product.stock?.quantity
            }
        }))

        if (total === 0) {
            const exists = await db.categories.findUnique({
                where: { slug },
                select: { id: true }
            });

            if (!exists) {
                return NextResponse.json({ error: 'Catégorie introuvable' }, { status: 404 });
            }
        }

        return NextResponse.json({
            data: formattedProducts,
            total,
            meta: buildMeta(total, pagination)
        }, { status: 200 });
    } catch (error) {
        console.error('[CATEGORY PRODUCTS]', error instanceof Error ? error.message : error);
        return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
    }
}