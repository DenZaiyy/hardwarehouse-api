import {describe, expect, test} from '@jest/globals';
import {typedAttributeValue} from "@/lib/api/attribute-values";

const PRODUCT = 'a'.repeat(24);
const CATEGORY_ATTRIBUTE = 'b'.repeat(24);
const row = (raw: unknown, type?: string) => typedAttributeValue(PRODUCT, CATEGORY_ATTRIBUTE, raw, type as never);

describe('typedAttributeValue', () => {
    test("renseigne la valeur numérique d'un attribut NUMBER", () => {
        expect(row('650', 'NUMBER')).toEqual({productId: PRODUCT, categoryAttributeId: CATEGORY_ATTRIBUTE, value: '650', numericValue: 650});
    });

    test("n'invente pas de nombre pour une saisie illisible", () => {
        expect(row('beaucoup', 'NUMBER')).toEqual({productId: PRODUCT, categoryAttributeId: CATEGORY_ATTRIBUTE, value: 'beaucoup'});
    });

    test("découpe la liste d'un attribut MULTI_SELECT, saisie en texte ou en tableau", () => {
        expect(row('ATX, Micro-ATX', 'MULTI_SELECT')).toEqual({
            productId: PRODUCT, categoryAttributeId: CATEGORY_ATTRIBUTE, value: 'ATX, Micro-ATX', values: ['ATX', 'Micro-ATX'],
        });
        expect(row(['AM4', 'AM5'], 'MULTI_SELECT')).toEqual({
            productId: PRODUCT, categoryAttributeId: CATEGORY_ATTRIBUTE, value: 'AM4, AM5', values: ['AM4', 'AM5'],
        });
    });

    test("garde la seule valeur texte pour les autres types", () => {
        expect(row('AM5', 'SELECT')).toEqual({productId: PRODUCT, categoryAttributeId: CATEGORY_ATTRIBUTE, value: 'AM5'});
        expect(row(true, 'BOOLEAN')).toEqual({productId: PRODUCT, categoryAttributeId: CATEGORY_ATTRIBUTE, value: 'true'});
    });
});
