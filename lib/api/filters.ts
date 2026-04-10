import {FilterParams, PaginationParams, SortParams} from "@/types/types";
import {Prisma} from "@prisma/client";

export function parsePagination(searchParams: URLSearchParams): PaginationParams {
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '25')));
    const skip = (page - 1) * limit;

    return { page, limit, skip };
}

export function parseSort(searchParams: URLSearchParams, allowedFields: string[] = ['createdAt', 'price', 'name']): SortParams {
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const order = searchParams.get('order') === 'asc' ? 'asc' : 'desc';

    return {
        sortBy: allowedFields.includes(sortBy) ? sortBy : 'createdAt',
        order
    };
}

export function parseFilters(searchParams: URLSearchParams): FilterParams {
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const search = searchParams.get('search');
    const inStock = searchParams.get('inStock');
    const active = searchParams.get('active');
    const productId = searchParams.get('productId');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const brandSlugs = parseMultiParam(searchParams, 'brands', 'brand');
    const categorySlugs = parseMultiParam(searchParams, 'categories', 'category');

    return {
        ...(minPrice && { minPrice: parseFloat(minPrice) }),
        ...(maxPrice && { maxPrice: parseFloat(maxPrice) }),
        ...(brandSlugs.length > 0 && {brandSlugs}),
        ...(categorySlugs.length > 0 && {categorySlugs}),
        ...(search && { search }),
        ...(inStock === 'true' && { inStock: true }),
        ...(active !== null && { active: active === 'true' }),
        ...(productId && { productId }),
        ...(startDate && {startDate}),
        ...(endDate && {endDate}),
    };
}

/**
 * Parse un paramètre multi-valeur de manière flexible.
 * Supporte : ?key=a,b  |  ?key=a&key=b  |  ?fallbackKey=a
 */
function parseMultiParam(searchParams: URLSearchParams, key: string, fallbackKey: string): string[] {
    // 1. Essayer le format multi/CSV avec la clé plurielle
    const values = searchParams.getAll(key);
    if (values.length > 0) {
        return values.flatMap(v => v.split(',')).filter(Boolean);
    }

    // 2. Fallback sur la clé singulière (rétrocompatibilité)
    const single = searchParams.get(fallbackKey);
    if (single) {
        return single.split(',').filter(Boolean);
    }

    return [];
}

export function buildBrandWhere(filters: FilterParams, extraWhere: object = {}) {
    return {
        ...extraWhere,
        ...(filters.active !== undefined && { active: filters.active }),
        ...(filters.search && {
            OR: [
                { name: { contains: filters.search, mode: 'insensitive' as Prisma.QueryMode } },
            ]
        }),
    };
}

export function buildCategoryWhere(filters: FilterParams, extraWhere: object = {}) {
    return {
        ...extraWhere,
        ...(filters.active !== undefined && { active: filters.active }),
        ...(filters.search && {
            OR: [
                { name: { contains: filters.search, mode: 'insensitive' as Prisma.QueryMode } },
            ]
        }),
    };
}

export function buildProductWhere(filters: FilterParams, extraWhere: object = {}) {
    // Gestion combinée min/max price en un seul objet Prisma
    const priceFilter = (filters.minPrice || filters.maxPrice) ? {
        price: {
            ...(filters.minPrice && {gte: filters.minPrice}),
            ...(filters.maxPrice && {lte: filters.maxPrice}),
        }
    } : {};

    return {
        ...extraWhere,
        ...(filters.active !== undefined && { active: filters.active }),
        ...priceFilter,
        ...(filters.brandSlugs && {brand: {slug: {in: filters.brandSlugs}}}),
        ...(filters.categorySlugs && {category: {slug: {in: filters.categorySlugs}}}),
        ...(filters.search && {
            OR: [
                { name: { contains: filters.search, mode: 'insensitive' as Prisma.QueryMode } },
                { shortDescription: { contains: filters.search, mode: 'insensitive' as Prisma.QueryMode } },
                { description: { contains: filters.search, mode: 'insensitive' as Prisma.QueryMode } }
            ]
        }),
        ...(filters.inStock && { stock: { quantity: { gt: 0 } } })
    };
}

export function buildDiscountWhere(filters: FilterParams, extraWhere: object = {}) {
    return {
        ...extraWhere,
        ...(filters.active !== undefined && { active: filters.active }),
        ...(filters.productId && { product: { id: filters.productId }}),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.search && {
            OR: [
                { product: { name: { contains: filters.search, mode: 'insensitive' as Prisma.QueryMode } } },
            ]
        })
    }
}

export function buildMeta(total: number, pagination: PaginationParams) {
    return {
        page: pagination.page,
        limit: pagination.limit,
        totalPages: Math.ceil(total / pagination.limit),
        hasNext: pagination.page * pagination.limit < total,
        hasPrev: pagination.page > 1
    };
}