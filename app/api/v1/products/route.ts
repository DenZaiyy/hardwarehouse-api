import {NextRequest, NextResponse} from "next/server";
import {db} from "@/lib/db";
import {slugifyName} from "@/lib/utils";
import {clientIp, rateLimiter} from "@/lib/rate-limit";
import {buildAttributeWhere, buildMeta, buildProductWhere, parseAttributeFilters, parseFilters, parsePagination, parseSort} from "@/lib/api/filters";
import {handleApiError} from "@/lib/api/handle-api-error";
import {ConflictError, NotFoundError} from "@/lib/api/errors";
import {isInternalRequest} from "@/lib/api/internal-request";
import {assertKnownAttributes} from "@/lib/api/known-attributes";
import {attributeValueRows} from "@/lib/api/attribute-values";
import {indexAttributes, parseProductIds, productSpecSelect} from "@/lib/api/product-specs";
import {productCreateSchema} from "@/lib/validators/productSchema";
import {requireStaff} from "@/lib/auth/require-role";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = req.nextUrl;
        const isInternal = isInternalRequest(req);

        // Lecture groupée (configurateur de la boutique) : 20 produits au plus, sans pagination, attributs sur demande
        const ids = searchParams.get('ids');
        if (ids !== null) {
            const withAttributes = searchParams.get('include') === 'attributes';
            const products = await db.products.findMany({where: {id: {in: parseProductIds(ids)}}, select: productSpecSelect});
            const data = products.map(({productAttributeValues, ...product}) => ({
                ...product,
                ...(withAttributes && {attributes: indexAttributes(productAttributeValues)}),
            }));

            return NextResponse.json({data, total: data.length}, {status: 200});
        }

        const sort = parseSort(searchParams);
        const filters = parseFilters(searchParams);
        const attributeFilters = parseAttributeFilters(searchParams);
        await assertKnownAttributes(attributeFilters);
        const where = {...buildProductWhere(filters), ...buildAttributeWhere(attributeFilters)};
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
    const { response } = await requireStaff();
    if (response) return response;

    const ip = clientIp(req);
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

            // Create attributes in same transaction, typées pour les filtres d'attributs du configurateur
            if (attributes && Object.keys(attributes).length > 0) {
                const attributeValueData = await attributeValueRows(tx, product.id, attributes);

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

