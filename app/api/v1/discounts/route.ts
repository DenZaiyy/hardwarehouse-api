import {NextRequest, NextResponse} from "next/server";
import {buildDiscountWhere, buildMeta, parseFilters, parsePagination, parseSort} from "@/lib/api/filters";
import {db} from "@/lib/db";
import {auth} from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = req.nextUrl;
        const isInternal = req.headers.get('x-internal-request') === process.env.INTERNAL_API_SECRET;

        const sort = parseSort(searchParams);
        const filters = parseFilters(searchParams);
        const where = buildDiscountWhere(filters);
        const pagination = isInternal ? null : parsePagination(searchParams);

        const select = {
            id: true,
            discount_amount: true,
            discount_type: true,
            createdAt: true,
            updatedAt: true,
            active: true,
            product: {
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

        const [discounts, total] = await Promise.all([
            db.discounts.findMany(queryOptions),
            db.discounts.count({ where })
        ]);

        return NextResponse.json({
            data: discounts,
            total,
            ...(pagination && { meta: buildMeta(total, pagination) })
        }, { status: 200 });
    } catch (error) {
        if (error instanceof Error) {
            console.error('[PRODUCTS] ', error.message)
            return NextResponse.json(
                { error: `[PRODUCTS] Erreur interne : ${error ? error.message : 'Erreur inconnue'}` },
                { status: 500 }
            );
        }

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
            productId,
            discountAmount,
            discountType,
            active = true,
        } = body;


        const existingProduct = await db.products.findUnique({
            where: { id: productId },
            select: { id: true }
        })

        if (!existingProduct) {
            throw new Error("PRODUCT_NOT_FOUND");
        }

        // Create the discount
        const discount = await db.discounts.create({
            data: {
                productId,
                discount_amount: discountAmount,
                discount_type: discountType,
                active
            },
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        price: true
                    }
                }
            }
        });

        // Calculate and update product discount_price
        let discountPrice = discount.product.price;
        if (discount.active) {
            if (discount.discount_type === "percentage") {
                discountPrice = discount.product.price * (1 - discount.discount_amount / 100);
            } else if (discount.discount_type === "fixed") {
                discountPrice = discount.product.price - discount.discount_amount;
            }
        }

        // Update product with discount price
        await db.products.update({
            where: { id: productId },
            data: { discount_price: discountPrice }
        });

        return NextResponse.json({ data: discount }, { status: 201 });

    } catch (e) {
        if (e instanceof Error) {
            console.error('[DISCOUNT PRODUCT]', e.message);
        }

        return NextResponse.json(
            { error: "Erreur lors de la création de la remise" },
            { status: 500 }
        );
    }
}