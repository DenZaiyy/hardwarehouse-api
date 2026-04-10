import {Prisma} from "@prisma/client";

export type PrismaTx = Prisma.TransactionClient;

export interface DiscountWithRelations {
    id: string;
    active: boolean;
    productId: string | null;
    categoryId: string | null;
    product: {
        id: string;
        name: string;
    } | null;
    category: {
        id: string;
        name: string;
        Products: { id: string }[];
    } | null;
}

export interface DiscountActionResult {
    type: "product" | "category" | "unknown";
    message: string;
}