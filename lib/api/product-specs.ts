import {z} from "zod";
import {Prisma} from "@prisma/client";
import {objectIdSchema} from "@/lib/validators/common";

// Lecture groupée du configurateur de la boutique : les composants déjà choisis, en un seul appel
export const MAX_PRODUCT_IDS = 20;

const productIdsSchema = z.string()
    .transform((value) => [...new Set(value.split(',').map((id) => id.trim()).filter(Boolean))])
    .pipe(z.array(objectIdSchema).min(1, "Au moins un identifiant").max(MAX_PRODUCT_IDS, `${MAX_PRODUCT_IDS} identifiants au plus`));

export function parseProductIds(value: string): string[] {
    return productIdsSchema.parse(value);
}

// Champs de la lecture groupée : ceux d'une liste, la catégorie, le stock et les valeurs d'attributs
export const productSpecSelect = {
    id: true,
    name: true,
    slug: true,
    price: true,
    discountPrice: true,
    discountAmount: true,
    active: true,
    thumbnail: true,
    category: {select: {slug: true}},
    stock: {select: {quantity: true}},
    productAttributeValues: {
        select: {value: true, values: true, numericValue: true, categoryAttribute: {select: {attribute: {select: {code: true}}}}},
    },
} satisfies Prisma.ProductsSelect;

type AttributeValueRow = {
    value: string;
    values: string[];
    numericValue: number | null;
    categoryAttribute: {attribute: {code: string}};
};

export type IndexedAttribute = {value: string; values?: string[]; numericValue?: number};

/** Valeurs d'attributs d'un produit indexées par code, sans les champs vides. */
export function indexAttributes(rows: AttributeValueRow[]): Record<string, IndexedAttribute> {
    return Object.fromEntries(rows.map((row) => [row.categoryAttribute.attribute.code, {
        value: row.value,
        ...(row.values.length > 0 && {values: row.values}),
        ...(row.numericValue !== null && {numericValue: row.numericValue}),
    }]));
}
