import {NextRequest, NextResponse} from "next/server";
import {buildDiscountWhere, buildMeta, parseFilters, parsePagination, parseSort} from "@/lib/api/filters";
import {db} from "@/lib/db";
import {refreshProductDiscount} from "@/lib/discounts/refresh-product-discount";
import {DiscountType} from "@prisma/client";
import {auth} from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = req.nextUrl;
        const isInternal = req.headers.get("x-internal-request") === process.env.INTERNAL_API_SECRET;

        const sort = parseSort(searchParams);
        const filters = parseFilters(searchParams);
        const where = buildDiscountWhere(filters);
        const pagination = isInternal ? null : parsePagination(searchParams);

        const select = {
            id: true,
            discountAmount: true,
            discountType: true,
            active: true,
            startDate: true,
            endDate: true,
            createdAt: true,
            updatedAt: true,
            product: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    active: true,
                    price: true,
                    discountPrice: true,
                    promote: true,
                },
            },
            category: {
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    active: true,
                },
            },
        };

        const queryOptions = {
            where,
            select,
            orderBy: { [sort.sortBy]: sort.order },
            ...(pagination && { skip: pagination.skip, take: pagination.limit }),
        };

        const [discounts, total] = await Promise.all([
            db.discounts.findMany(queryOptions),
            db.discounts.count({ where }),
        ]);

        return NextResponse.json(
            {
                data: discounts,
                total,
                ...(pagination && { meta: buildMeta(total, pagination) }),
            },
            { status: 200 }
        );
    } catch (error) {
        const message = error instanceof Error ? error.message : "Erreur inconnue";
        console.error("[DISCOUNTS]", message);

        return NextResponse.json(
            { error: `[DISCOUNTS] Erreur interne : ${message}` },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized", statusCode: 401 }, { status: 401 });
    }

    try {
        const body = await req.json();

        const {
            productId = null,
            categoryId = null,
            discountAmount,
            discountType,
            active = true,
            startDate,
            endDate,
        } = body;

        const hasProduct = !!productId;
        const hasCategory = !!categoryId;

        if ((hasProduct && hasCategory) || (!hasProduct && !hasCategory)) {
            return NextResponse.json(
                { error: "Il faut renseigner soit productId, soit categoryId, mais pas les deux." },
                { status: 400 }
            );
        }

        if (typeof discountAmount !== "number" || discountAmount <= 0) {
            return NextResponse.json(
                { error: "discountAmount invalide." },
                { status: 400 }
            );
        }

        if (!Object.values(DiscountType).includes(discountType)) {
            return NextResponse.json(
                { error: "discountType invalide." },
                { status: 400 }
            );
        }

        if (discountType === DiscountType.PERCENTAGE && (discountAmount <= 0 || discountAmount > 100)) {
            return NextResponse.json(
                { error: "Une remise en pourcentage doit être comprise entre 0 et 100." },
                { status: 400 }
            );
        }

        const parsedStartDate = startDate ? new Date(startDate) : undefined;
        const parsedEndDate = endDate ? new Date(endDate) : undefined;

        if (parsedStartDate && Number.isNaN(parsedStartDate.getTime())) {
            return NextResponse.json({ error: "startDate invalide." }, { status: 400 });
        }

        if (parsedEndDate && Number.isNaN(parsedEndDate.getTime())) {
            return NextResponse.json({ error: "endDate invalide." }, { status: 400 });
        }

        if (parsedStartDate && parsedEndDate && parsedEndDate < parsedStartDate) {
            return NextResponse.json(
                { error: "endDate doit être postérieure à startDate." },
                { status: 400 }
            );
        }

        const result = await db.$transaction(async (tx) => {
            const now = new Date();

            if (hasProduct) {
                const product = await tx.products.findUnique({
                    where: { id: productId },
                    select: {
                        id: true,
                        name: true,
                    },
                });

                if (!product) {
                    throw new Error("PRODUCT_NOT_FOUND");
                }

                const existingProductDiscount = await tx.discounts.findFirst({
                    where: {
                        productId,
                        active: true,
                        startDate: { lte: now },
                        OR: [
                            { endDate: null },
                            { endDate: { gte: now } },
                        ],
                    },
                    select: { id: true },
                });

                if (existingProductDiscount) {
                    throw new Error("PRODUCT_DISCOUNT_ALREADY_EXISTS");
                }

                const discount = await tx.discounts.create({
                    data: {
                        productId,
                        discountAmount,
                        discountType,
                        active,
                        startDate: parsedStartDate,
                        endDate: parsedEndDate ?? null,
                    },
                    include: {
                        product: {
                            select: {
                                id: true,
                                name: true,
                                price: true,
                            },
                        },
                    },
                });

                await refreshProductDiscount(tx, productId);

                return discount;
            }

            const category = await tx.categories.findUnique({
                where: { id: categoryId },
                select: {
                    id: true,
                    name: true,
                    slug: true,
                    Products: {
                        select: {
                            id: true,
                        },
                    },
                },
            });

            if (!category) {
                throw new Error("CATEGORY_NOT_FOUND");
            }

            const existingCategoryDiscount = await tx.discounts.findFirst({
                where: {
                    categoryId,
                    active: true,
                    startDate: { lte: now },
                    OR: [
                        { endDate: null },
                        { endDate: { gte: now } },
                    ],
                },
                select: { id: true },
            });

            if (existingCategoryDiscount) {
                throw new Error("CATEGORY_DISCOUNT_ALREADY_EXISTS");
            }

            const discount = await tx.discounts.create({
                data: {
                    categoryId,
                    discountAmount,
                    discountType,
                    active,
                    startDate: parsedStartDate,
                    endDate: parsedEndDate ?? null,
                },
                include: {
                    category: {
                        select: {
                            id: true,
                            name: true,
                            slug: true,
                        },
                    },
                },
            });

            for (const product of category.Products) {
                await refreshProductDiscount(tx, product.id);
            }

            return discount;
        });

        return NextResponse.json({ data: result }, { status: 201 });
    } catch (e) {
        if (e instanceof Error) {
            console.error("[DISCOUNT_CREATE]", e.message);

            if (e.message === "PRODUCT_NOT_FOUND") {
                return NextResponse.json({ error: "Produit introuvable." }, { status: 404 });
            }

            if (e.message === "CATEGORY_NOT_FOUND") {
                return NextResponse.json({ error: "Catégorie introuvable." }, { status: 404 });
            }

            if (e.message === "PRODUCT_DISCOUNT_ALREADY_EXISTS") {
                return NextResponse.json(
                    { error: "Une remise active existe déjà pour ce produit." },
                    { status: 409 }
                );
            }

            if (e.message === "CATEGORY_DISCOUNT_ALREADY_EXISTS") {
                return NextResponse.json(
                    { error: "Une remise active existe déjà pour cette catégorie." },
                    { status: 409 }
                );
            }
        }

        return NextResponse.json(
            { error: "Erreur lors de la création de la remise." },
            { status: 500 }
        );
    }
}