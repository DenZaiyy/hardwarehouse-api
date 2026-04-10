import {DiscountType} from "@prisma/client";

export function computeDiscountedPrice(
    basePrice: number,
    discountAmount: number,
    discountType: DiscountType
): number {
    let result = basePrice;

    if (discountType === "PERCENTAGE") {
        result = basePrice - (basePrice * discountAmount) / 100;
    }

    if (discountType === "FIXED") {
        result = basePrice - discountAmount;
    }

    return Math.max(0, Number(result.toFixed(2)));
}