import {ApiError} from "@/lib/api/errors";

export class ProductDiscountAlreadyExistsError extends ApiError {
    constructor() {
        super("Une remise active existe déjà pour ce produit.", 409, "PRODUCT_DISCOUNT_ALREADY_EXISTS");
    }
}

export class CategoryDiscountAlreadyExistsError extends ApiError {
    constructor() {
        super("Une remise active existe déjà pour cette catégorie.", 409, "CATEGORY_DISCOUNT_ALREADY_EXISTS");
    }
}