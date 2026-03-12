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
                    slug: true,
                    price: true,
                    thumbnail: true,
                    shortDescription: true,
                    brand: {
                        select: { id: true, name: true, slug: true }
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
            data: products,
            meta: buildMeta(total, pagination)
        }, { status: 200 });
    } catch (error) {
        console.error('[CATEGORY PRODUCTS]', error instanceof Error ? error.message : error);
        return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
    }
}