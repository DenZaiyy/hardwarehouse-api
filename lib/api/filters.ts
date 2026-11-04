import {FilterParams, PaginationParams, SortParams} from "@/types/types";
import {Prisma} from "@prisma/client";
import {z} from "zod";

// Une valeur qui n'est pas un nombre (?page=abc) retombe sur la valeur par défaut : NaN ferait échouer Prisma (500)
function parseInteger(value: string | null, fallback: number): number {
    const parsed = parseInt(value ?? '');
    return Number.isNaN(parsed) ? fallback : parsed;
}

export function parsePagination(searchParams: URLSearchParams): PaginationParams {
    const page = Math.max(1, parseInteger(searchParams.get('page'), 1));
    const limit = Math.min(50, Math.max(1, parseInteger(searchParams.get('limit'), 25)));
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

export type AttributeFilter =
    | {kind: 'attr' | 'attrHas'; code: string; values: string[]}
    | {kind: 'attrMin' | 'attrMax'; code: string; value: number};

const ATTRIBUTE_PARAM = /^(attr|attrHas|attrMin|attrMax)\[(.*)]$/;
// Même forme que les codes attribués par prisma/attribute-codes.js
const attributeCodeSchema = z.string().regex(/^[a-z][a-z0-9_]*$/, "Code d'attribut invalide");
const attributeValuesSchema = z.string()
    .transform((value) => value.split(',').map((item) => item.trim()).filter(Boolean))
    .pipe(z.array(z.string()).min(1, "Valeur de filtre requise"));
const attributeBoundSchema = z.string().trim().min(1, "Borne requise").pipe(z.coerce.number({error: "La borne doit être un nombre"}));

/**
 * Filtres d'attributs génériques du catalogue, dont se sert le configurateur de la boutique :
 * attr[code]=v1,v2 (valeur dans la liste), attrHas[code]=v (la liste du produit contient chaque valeur),
 * attrMin[code]=n et attrMax[code]=n (bornes de la valeur numérique). Un code ou une valeur mal formés lèvent une
 * ZodError (400 par handleApiError) : un filtre ignoré en silence ferait passer des produits incompatibles.
 */
export function parseAttributeFilters(searchParams: URLSearchParams): AttributeFilter[] {
    const filters: AttributeFilter[] = [];

    for (const [key, raw] of searchParams) {
        const match = ATTRIBUTE_PARAM.exec(key);
        if (!match) continue;

        const kind = match[1] as AttributeFilter['kind'];
        const code = attributeCodeSchema.parse(match[2]);
        filters.push(kind === 'attr' || kind === 'attrHas'
            ? {kind, code, values: attributeValuesSchema.parse(raw)}
            : {kind, code, value: attributeBoundSchema.parse(raw)});
    }

    return filters;
}

function attributeValueWhere(filter: AttributeFilter): Prisma.ProductAttributeValuesWhereInput {
    switch (filter.kind) {
        case 'attr':
            return {value: {in: filter.values}};
        case 'attrHas':
            return {values: {hasEvery: filter.values}};
        case 'attrMin':
            return {numericValue: {gte: filter.value}};
        case 'attrMax':
            return {numericValue: {lte: filter.value}};
    }
}

/** Chaque filtre exige du produit une valeur de cet attribut qui le respecte : un produit sans l'attribut est exclu. */
export function buildAttributeWhere(filters: AttributeFilter[]): Prisma.ProductsWhereInput {
    if (filters.length === 0) return {};

    return {
        AND: filters.map((filter) => ({
            productAttributeValues: {
                some: {categoryAttribute: {attribute: {code: filter.code}}, ...attributeValueWhere(filter)},
            },
        })),
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