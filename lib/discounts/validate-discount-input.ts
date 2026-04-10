import {DiscountType} from "@prisma/client";
import {BadRequestError} from "@/lib/api/errors";

export interface DiscountInput {
    productId: string | null;
    categoryId: string | null;
    discountAmount: number;
    discountType: DiscountType;
    active: boolean;
    startDate?: Date;
    endDate?: Date;
}

export function validateDiscountInput(body: Record<string, unknown>): DiscountInput {
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
        throw new BadRequestError("Il faut renseigner soit productId, soit categoryId, mais pas les deux.");
    }

    if (typeof discountAmount !== "number" || discountAmount <= 0) {
        throw new BadRequestError("discountAmount invalide.");
    }

    if (!Object.values(DiscountType).includes(discountType as DiscountType)) {
        throw new BadRequestError("discountType invalide.");
    }

    if (discountType === DiscountType.PERCENTAGE && (discountAmount <= 0 || discountAmount > 100)) {
        throw new BadRequestError("Une remise en pourcentage doit être comprise entre 0 et 100.");
    }

    const parsedStartDate = startDate ? new Date(startDate as string) : undefined;
    const parsedEndDate = endDate ? new Date(endDate as string) : undefined;

    if (parsedStartDate && Number.isNaN(parsedStartDate.getTime())) {
        throw new BadRequestError("startDate invalide.");
    }

    if (parsedEndDate && Number.isNaN(parsedEndDate.getTime())) {
        throw new BadRequestError("endDate invalide.");
    }

    if (parsedStartDate && parsedEndDate && parsedEndDate < parsedStartDate) {
        throw new BadRequestError("endDate doit être postérieure à startDate.");
    }

    return {
        productId: productId as string | null,
        categoryId: categoryId as string | null,
        discountAmount: discountAmount as number,
        discountType: discountType as DiscountType,
        active: active as boolean,
        startDate: parsedStartDate,
        endDate: parsedEndDate,
    };
}