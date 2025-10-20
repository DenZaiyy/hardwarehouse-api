import {Prisma} from "@/app/generated/prisma/client";
import ProductsGetPayload = Prisma.ProductsGetPayload;
import StocksGetPayload = Prisma.StocksGetPayload;
import TransactionsGetPayload = Prisma.TransactionsGetPayload;
import PurchaseOrdersGetPayload = Prisma.PurchaseOrderGetPayload;

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
export type ProductsWithStocks = ProductsGetPayload<{ include: { stocks: true }}>

export type StocksWithProduct = StocksGetPayload<{ include: { product: true } }>

export type TransactionsWithProduct = TransactionsGetPayload<{ include: { product: true } }>
export type PurchaseOrdersWithProduct = PurchaseOrdersGetPayload<{ include: { product: true } }>