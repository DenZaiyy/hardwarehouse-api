import {AttributeType, Prisma} from "@prisma/client";

type AttributeValueRow = {
    productId: string;
    categoryAttributeId: string;
    value: string;
    numericValue?: number;
    values?: string[];
};

/**
 * Valeur saisie dans le back-office → champs enregistrés : numericValue pour un attribut NUMBER, que comparent les
 * filtres attrMin et attrMax, values pour un MULTI_SELECT (tableau, ou texte séparé par des virgules).
 */
export function typedAttributeValue(productId: string, categoryAttributeId: string, raw: unknown, type?: AttributeType): AttributeValueRow {
    const list = Array.isArray(raw) ? raw.map(String) : String(raw).split(',').map((item) => item.trim()).filter(Boolean);
    const value = Array.isArray(raw) ? list.join(', ') : String(raw);

    return {
        productId,
        categoryAttributeId,
        value,
        ...(type === 'NUMBER' && value.trim() !== '' && Number.isFinite(Number(value)) && {numericValue: Number(value)}),
        ...(type === 'MULTI_SELECT' && {values: list}),
    };
}

/** Lignes à créer pour les valeurs saisies d'un produit, typées selon l'attribut de chaque catégorie. */
export async function attributeValueRows(tx: Prisma.TransactionClient, productId: string, attributes: Record<string, unknown>): Promise<AttributeValueRow[]> {
    const entries = Object.entries(attributes).filter(([, value]) => value && String(value).trim() !== '');
    if (entries.length === 0) return [];

    const categoryAttributes = await tx.categoryAttributes.findMany({
        where: {id: {in: entries.map(([categoryAttributeId]) => categoryAttributeId)}},
        select: {id: true, attribute: {select: {type: true}}},
    });
    const types = new Map(categoryAttributes.map(({id, attribute}) => [id, attribute.type]));

    return entries.map(([categoryAttributeId, value]) => typedAttributeValue(productId, categoryAttributeId, value, types.get(categoryAttributeId)));
}
