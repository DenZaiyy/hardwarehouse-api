import {NextRequest, NextResponse} from "next/server";
import {buildDiscountWhere, buildMeta, parseFilters, parsePagination, parseSort} from "@/lib/api/filters";
import {db} from "@/lib/db";
import {handleApiError} from "@/lib/api/handle-api-error";
import {validateDiscountInput} from "@/lib/discounts/validate-discount-input";
import {createDiscount} from "@/lib/discounts/create-discount";
import {auth} from "@clerk/nextjs/server";
import {ForbiddenError, UnauthorizedError} from "@/lib/api/errors";

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = req.nextUrl;
        const isInternal = req.headers.get("x-internal-request") === process.env.INTERNAL_API_SECRET;

        const sort = parseSort(searchParams);
        const filters = parseFilters(searchParams);
        const where = buildDiscountWhere(filters);
        const pagination = isInternal ? null : parsePagination(searchParams);

        const [discounts, total] = await Promise.all([
            db.discounts.findMany({
                where,
                select: {
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
                },
                orderBy: { [sort.sortBy]: sort.order },
                ...(pagination && { skip: pagination.skip, take: pagination.limit }),
            }),
            db.discounts.count({ where }),
        ]);

        return NextResponse.json({
            data: discounts,
            total,
            ...(pagination && { meta: buildMeta(total, pagination) }),
        });
    } catch (error) {
        return handleApiError('DISCOUNTS GET', error);
    }
}

export async function POST(req: NextRequest) {
    try {
        const { userId, sessionClaims } = await auth();
        if (!userId) throw new UnauthorizedError();
        if (sessionClaims?.publicMetadata?.role !== "admin") throw new ForbiddenError();

        const body = await req.json();
        const input = validateDiscountInput(body);

        const result = await db.$transaction((tx) => createDiscount(tx, input));

        return NextResponse.json({ data: result }, { status: 201 });
    } catch (error) {
        return handleApiError("DISCOUNTS POST", error);
    }
}