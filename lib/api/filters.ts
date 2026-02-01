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
    search?: string;
    inStock?: boolean;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

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
    const brandSlug = searchParams.get('brand');
    const search = searchParams.get('search');
    const inStock = searchParams.get('inStock');

    return {
        ...(minPrice && { minPrice: parseFloat(minPrice) }),
        ...(maxPrice && { maxPrice: parseFloat(maxPrice) }),
        ...(brandSlug && { brandSlug }),
        ...(search && { search }),
        ...(inStock === 'true' && { inStock: true })
    };
}

export function buildProductWhere(filters: FilterParams, extraWhere: object = {}) {
    return {
        active: true,
        ...extraWhere,
        ...(filters.minPrice && { price: { gte: filters.minPrice } }),
        ...(filters.maxPrice && { price: { lte: filters.maxPrice } }),
        ...(filters.brandSlug && { brand: { slug: filters.brandSlug } }),
        ...(filters.search && {
            OR: [
                { name: { contains: filters.search } },
                { shortDescription: { contains: filters.search } }
            ]
        }),
        ...(filters.inStock && { stock: { quantity: { gt: 0 } } })
    };
}

export function buildMeta(total: number, pagination: PaginationParams) {
    return {
        total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: Math.ceil(total / pagination.limit),
        hasNext: pagination.page * pagination.limit < total,
        hasPrev: pagination.page > 1
    };
}