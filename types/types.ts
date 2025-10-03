import {Prisma} from "@/app/generated/prisma/client";
import ProductsGetPayload = Prisma.ProductsGetPayload;

export interface ProductFilters {
    name?: string;
    category?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    page?: number;
    itemsPerPage?: number;
}

export interface BrandFilters {
    page?: number;
    itemsPerPage?: number;
}

export type ProductsWithCategoryAndBrand = ProductsGetPayload<{ include: { category: true; brand: true } }>