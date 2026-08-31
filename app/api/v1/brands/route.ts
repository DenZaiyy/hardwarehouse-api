import {NextRequest, NextResponse} from "next/server";
import {db} from "@/lib/db";
import {rateLimiter, slugifyName} from "@/lib/utils";
import {auth} from "@clerk/nextjs/server";
import {buildBrandWhere, buildMeta, parseFilters, parsePagination, parseSort} from "@/lib/api/filters";
import {handleApiError} from "@/lib/api/handle-api-error";
import {ConflictError} from "@/lib/api/errors";
import {brandSchema} from "@/lib/validators/brandSchema";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = req.nextUrl;
        const isInternal = req.headers.get('x-internal-request') === process.env.INTERNAL_API_SECRET;

        const sort = parseSort(searchParams);
        const filters = parseFilters(searchParams);
        const where = buildBrandWhere(filters);
        const pagination = isInternal ? null : parsePagination(searchParams);

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
            ...(pagination && { skip: pagination.skip, take: pagination.limit })
        }

        const [brands, total] = await Promise.all([
            db.brands.findMany(queryOptions),
            db.brands.count({ where })
        ]);

        const formattedBrands = brands.map((brand) => ({
            id: brand.id,
            name: brand.name,
            slug: brand.slug,
            logo: brand.logo,
            active: brand.active,
            createdAt: brand.createdAt,
            updatedAt: brand.updatedAt,
            productsCount: brand._count.Products,
        }));

        return NextResponse.json({
            data: formattedBrands,
            total,
            ...(pagination && { meta: buildMeta(total, pagination) })
        }, { status: 200 });
    } catch (error) {
        return handleApiError("BRANDS GET", error);
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
        const body = await req.json();
        const { name, active = true } = brandSchema.parse(body);

        const slug = slugifyName(name);

        const result = await db.$transaction(async (tx) => {
            // Check if brand exists
            const existingBrand = await tx.brands.findUnique({
                where: { slug },
                select: { id: true }
            });

            if (existingBrand) throw new ConflictError("La marque existe déjà");

            // Create brand (sans logo - sera ajouté via endpoint d'upload séparé)
            const brand = await tx.brands.create({
                data: {
                    name: name,
                    slug: slug,
                    active: Boolean(active)
                },
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    logo: true,
                    active: true,
                    createdAt: true
                }
            });

            return brand;
        });

        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        return handleApiError("BRAND POST", error);
    }
}