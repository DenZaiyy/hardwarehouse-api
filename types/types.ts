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