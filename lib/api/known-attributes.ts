import {db} from "@/lib/db";
import {BadRequestError} from "@/lib/api/errors";
import type {AttributeFilter} from "@/lib/api/filters";

/**
 * Refuse un filtre sur un code d'attribut inconnu (400) : une faute de frappe dans une règle de la boutique doit
 * apparaître comme une erreur, pas comme une liste vide présentée au client comme « aucun produit compatible ».
 */
export async function assertKnownAttributes(filters: AttributeFilter[]): Promise<void> {
    const codes = [...new Set(filters.map((filter) => filter.code))];
    if (codes.length === 0) return;

    const known = await db.attributes.findMany({where: {code: {in: codes}}, select: {code: true}});
    const missing = codes.filter((code) => !known.some((attribute) => attribute.code === code));
    if (missing.length > 0) {
        throw new BadRequestError(`Attribut inconnu : ${missing.join(', ')}`);
    }
}
