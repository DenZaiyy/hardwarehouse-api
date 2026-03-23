import {Prisma} from "@prisma/client";
import ProductsGetPayload = Prisma.ProductsGetPayload;
import StocksGetPayload = Prisma.StocksGetPayload;
import TransactionsGetPayload = Prisma.TransactionsGetPayload;
import PurchaseOrdersGetPayload = Prisma.PurchaseOrderGetPayload;

export type ProductsWithCategoryAndBrandAndAttributes = ProductsGetPayload<{ include: { category: true; brand: true; productAttributeValues: { include: { categoryAttribute: { include: { attribute: true } } } } } }>
export type ProductsWithCategoryAndBrand = ProductsGetPayload<{ include: { category: true; brand: true; } }>
export type ProductsWithStocks = ProductsGetPayload<{ include: { stock: true }}>

// Type pour les données d'entrée de création/mise à jour de produit
export interface ProductInput {
    name?: string;
    price?: number;
    description?: string;
    shortDescription?: string;
    active?: boolean;
    brandId?: string;
    category?: string; // slug de la catégorie
    attributes?: Record<string, string>;
}

export type StocksWithProduct = StocksGetPayload<{ include: { product: true } }>

export type TransactionsWithProduct = TransactionsGetPayload<{ include: { product: true } }>
export type PurchaseOrdersWithProduct = PurchaseOrdersGetPayload<{ include: { product: true } }>

export interface TransactionsResponse {
    data: TransactionsWithProduct[];
    count: number;
}

export interface OrdersResponse {
    data: PurchaseOrdersWithProduct[];
    count: number;
}

export interface PaginationParams {
    page: number;
    limit: number;
    skip: number;
}

export interface SortParams {
    sortBy: string;
    order: 'asc' | 'desc';
}

export interface FilterParams {
    minPrice?: number;
    maxPrice?: number;
    brandSlug?: string;
    categorySlug?: string;
    search?: string;
    inStock?: boolean;
    active?: boolean;
    productId?: string;
    startDate?: Date;
    endDate?: Date;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

// ============================================================================
// UPLOAD SYSTEM TYPES
// ============================================================================

export type UploadEntityType = 'products' | 'categories' | 'brands';

export interface ResponsiveSize {
    suffix: string; // '', '@2x', '-sm', '-lg'
    width: number;
}

export interface UploadConfig {
    maxSize: number;
    allowedMimeTypes: string[];
    quality: number;
    dimensions: {
        thumbnail: number;
        logo: number;
        gallery: number;
    };
    responsiveSizes: {
        thumbnail: ResponsiveSize[];
        logo: ResponsiveSize[];
        gallery: ResponsiveSize[];
    };
}

export interface ResponsiveImageSet {
    main: string; // URL principale
    sizes: { [suffix: string]: string }; // URLs des autres tailles
}

export interface UploadResult {
    success: true;
    thumbnail?: string;
    logo?: string;
    images?: string[];
    // Extensions pour responsive
    thumbnailSet?: ResponsiveImageSet;
    logoSet?: ResponsiveImageSet;
    imagesSet?: ResponsiveImageSet[];
}

export interface UploadError {
    success: false;
    error: string;
    code: 'INVALID_MIME_TYPE' | 'FILE_TOO_LARGE' | 'PROCESSING_ERROR' | 'INVALID_TYPE';
}

export type UploadResponse = UploadResult | UploadError;

export interface DeleteResult {
    success: true;
    deleted: string[];
}

export interface DeleteError {
    success: false;
    error: string;
    code: 'NOT_FOUND' | 'DELETE_ERROR';
}

export type DeleteResponse = DeleteResult | DeleteError;

export interface ImageUploadOptions {
    width?: number;
    height?: number;
    quality?: number;
}

export interface ProductUploadData {
    thumbnail?: File;
    images?: Map<number, File>;
}

export interface LogoUploadData {
    logo?: File;
}