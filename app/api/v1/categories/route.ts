import {NextRequest, NextResponse} from "next/server";
import {db} from "@/lib/db";
import {rateLimiter, slugifyName} from "@/lib/utils";
import {auth} from "@clerk/nextjs/server";
import {buildCategoryWhere, parseFilters, parseSort} from "@/lib/api/filters";
import {handleApiError} from "@/lib/api/handle-api-error";
import {ConflictError} from "@/lib/api/errors";
import {categorySchema} from "@/lib/validators/categorySchema";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = req.nextUrl;

        const sort = parseSort(searchParams);
        const filters = parseFilters(searchParams);
        const where = buildCategoryWhere(filters);

        const select = {
            id: true,
            name: true,
            slug: true,
            logo: true,
            active: true,
            createdAt: true,
            updatedAt: true,
            _count: {
                select: {
                    Products: true
                }
            }
        }

        const queryOptions = {
            where,
            select,
            orderBy: {[sort.sortBy]: sort.order},
        }

        const [categories, total] = await Promise.all([
            db.categories.findMany(queryOptions),
            db.categories.count({ where })
        ]);

        const formattedCategories = categories.map((category) => ({
            id: category.id,
            name: category.name,
            slug: category.slug,
            logo: category.logo,
            active: category.active,
            createdAt: category.createdAt,
            updatedAt: category.updatedAt,
            productsCount: category._count.Products,
        }));

        return NextResponse.json({
            data: formattedCategories,
            total,
        }, { status: 200 });
    } catch (error) {
        return handleApiError("CATEGORIES GET", error);
    }
}

export async function POST(req: NextRequest) {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized", statusCode: 401 }, { status: 401 });
    }

    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '127.0.0.1';
    const { success } = await rateLimiter.limit(ip);

    if (!success) {
        return NextResponse.json({ error: "Trop de demandes" }, { status: 429 });
    }

    try {
        // Accepter JSON au lieu de FormData
        const body = await req.json();
        const { name, active = true } = categorySchema.parse(body);

        const slug = slugifyName(name);

        const result = await db.$transaction(async (tx) => {
            // Check if category exists
            const existingCategory = await tx.categories.findUnique({
                where: { slug },
                select: { id: true }
            });

            if (existingCategory) throw new ConflictError("La catégorie existe déjà");

            // Create category
            const category = await tx.categories.create({
                data: {
                    name: name,
                    active: Boolean(active),
                    slug: slug
                },
                select: {
                    id: true,
                    name: true,
                    active: true,
                    slug: true,
                    logo: true,
                    createdAt: true
                }
            });

            return category;
        });

        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        return handleApiError("CATEGORY POST", error);
    }
}