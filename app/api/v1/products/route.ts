import {NextRequest, NextResponse} from "next/server";
import {db} from "@/lib/db";
import {rateLimiter, slugifyName} from "@/lib/utils";
import {auth} from "@clerk/nextjs/server";
import {buildMeta, buildProductWhere, parseFilters, parsePagination, parseSort} from "@/lib/api/filters";
import {handleApiError} from "@/lib/api/handle-api-error";
import {ConflictError, NotFoundError} from "@/lib/api/errors";
import {productCreateSchema} from "@/lib/validators/productSchema";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = req.nextUrl;
        const isInternal = req.headers.get('x-internal-request') === process.env.INTERNAL_API_SECRET;

        const sort = parseSort(searchParams);
        const filters = parseFilters(searchParams);
        const where = buildProductWhere(filters);
        const pagination = isInternal ? null : parsePagination(searchParams);

        const select = {
            id: true,
            name: true,
            slug: true,
            sku: true,
            mpn: true,
            ean13: true,
            price: true,
            discountPrice: true,
            discountAmount: true,
            promote: true,
            thumbnail: true,
            shortDescription: true,
            createdAt: true,
            updatedAt: true,
            active: true,
            category: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    active: true
                }
            },
            brand: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    active: true
                }
            }
        }

        const queryOptions = {
            where,
            select,
            orderBy: { [sort.sortBy]: sort.order },
            ...(pagination && { skip: pagination.skip, take: pagination.limit })
        };

        const [products, total] = await Promise.all([
            db.products.findMany(queryOptions),
            db.products.count({ where })
        ]);

        return NextResponse.json({
            data: products,
            total,
            ...(pagination && { meta: buildMeta(total, pagination) })
        }, { status: 200 });
    } catch (error) {
        return handleApiError("PRODUCTS GET", error);
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
        return new NextResponse('Too Many Requests', { status: 429 });
    }

    try {
        const body = await req.json();
        const {
            name,
            description,
            shortDescription,
            price,
            active,
            category,
            brandId,
            attributes
        } = productCreateSchema.parse(body);

        const slug = slugifyName(name);

        const result = await db.$transaction(async (tx) => {
            // Vérifications d'existence en parallèle
            const [existingProduct, existingCategory, existingBrand] = await Promise.all([
                tx.products.findUnique({
                    where: { slug },
                    select: { id: true }
                }),
                tx.categories.findUnique({
                    where: { slug: category },
                    select: { id: true }
                }),
                tx.brands.findUnique({
                    where: { id: brandId },
                    select: { id: true }
                })
            ]);

            // Validation checks
            if (existingProduct) throw new ConflictError("Le produit existe déjà");
            if (!existingCategory) throw new NotFoundError("Catégorie");
            if (!existingBrand) throw new NotFoundError("Marque");

            // Pas d'include ici : les productAttributeValues n'existent pas encore, ce serait vide.
            const product = await tx.products.create({
                data: {
                    name: name,
                    slug: slug,
                    description: description || null,
                    shortDescription: shortDescription || null,
                    price: Number(price),
                    active: Boolean(active),
                    categoryId: existingCategory.id,
                    brandId: existingBrand.id
                }
            });

            // Create attributes in same transaction
            if (attributes && Object.keys(attributes).length > 0) {
                const attributeValueData = Object.entries(attributes)
                    .filter(([, value]) => value && String(value).trim() !== '')
                    .map(([categoryAttributeId, value]) => ({
                        productId: product.id,
                        categoryAttributeId: categoryAttributeId,
                        value: String(value)
                    }));

                if (attributeValueData.length > 0) {
                    await tx.productAttributeValues.createMany({
                        data: attributeValueData
                    });
                }
            }

            return tx.products.findUniqueOrThrow({
                where: { id: product.id },
                include: {
                    category: true,
                    brand: true,
                    productAttributeValues: {
                        include: {
                            categoryAttribute: {
                                include: {
                                    attribute: true
                                }
                            }
                        }
                    }
                }
            });
        });

        return NextResponse.json(result, { status: 201 });
    } catch (error) {
        return handleApiError("PRODUCTS POST", error);
    }
}

