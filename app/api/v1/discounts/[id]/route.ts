import {NextRequest, NextResponse} from "next/server";
import {db} from "@/lib/db";
import {auth} from "@clerk/nextjs/server";
import {handleApiError} from "@/lib/api/handle-api-error";
import {BadRequestError, ForbiddenError, NotFoundError, UnauthorizedError} from "@/lib/api/errors";
import {getDiscountWithRelations} from "@/lib/discounts/get-discount-with-relations";
import {refreshDiscountRelations} from "@/lib/discounts/refresh-discount-relations";

type RouteCtx = RouteContext<'/api/v1/discounts/[id]'>;

export async function GET(_req: NextRequest, ctx: RouteCtx) {
    try {
        const { id } = await ctx.params;

        const discount = await db.discounts.findUnique({
            where: { id },
            include: {
                category: { select: { id: true, name: true, slug: true } },
                product: { select: { id: true, name: true, slug: true, price: true, thumbnail: true } },
            },
        });

        if (!discount) throw new NotFoundError("Remise");

        return NextResponse.json(discount);
    } catch (error) {
        return handleApiError("DISCOUNT GET", error);
    }
}

export async function PATCH(req: NextRequest, ctx: RouteCtx) {
    try {
        const { userId, sessionClaims } = await auth();
        if (!userId) throw new UnauthorizedError();
        if (sessionClaims?.publicMetadata?.role !== "admin") throw new ForbiddenError();

        const { id } = await ctx.params;
        const { active } = await req.json();

        if (active === undefined) {
            throw new BadRequestError("Au moins un champ est obligatoire.");
        }

        const result = await db.$transaction(async (tx) => {
            const discount = await getDiscountWithRelations(tx, id);
            if (!discount) throw new NotFoundError("Remise");

            if (active !== discount.active) {
                await tx.discounts.update({
                    where: { id },
                    data: { active: Boolean(active) },
                });
            }

            return refreshDiscountRelations(tx, discount, "updated");
        });

        return NextResponse.json(result);
    } catch (error) {
        return handleApiError("DISCOUNT PATCH", error);
    }
}

export async function DELETE(_req: NextRequest, ctx: RouteCtx ) {
    try {
        const { userId, sessionClaims } = await auth();
        if (!userId) throw new UnauthorizedError();
        if (sessionClaims?.publicMetadata?.role !== "admin") throw new ForbiddenError();

        const { id } = await ctx.params;

        const result = await db.$transaction(async (tx) => {
            const discount = await getDiscountWithRelations(tx, id);
            if (!discount) throw new NotFoundError("Remise");

            await tx.discounts.delete({ where: { id } });

            return refreshDiscountRelations(tx, discount, "deleted");
        });

        return NextResponse.json(result);
    } catch (error) {
        return handleApiError('DISCOUNT DELETE', error);
    }
}