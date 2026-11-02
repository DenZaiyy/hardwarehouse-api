import {describe, expect, test} from '@jest/globals';
import {indexAttributes, parseProductIds} from "@/lib/api/product-specs";

const id = (n: number) => n.toString(16).padStart(24, '0');

describe('parseProductIds', () => {
    test("lit les identifiants séparés par des virgules, sans doublon", () => {
        expect(parseProductIds(`${id(1)},${id(2)},${id(1)}`)).toEqual([id(1), id(2)]);
    });

    test("refuse un identifiant qui n'est pas un ObjectId", () => {
        expect(() => parseProductIds(`${id(1)},abc`)).toThrow();
        expect(() => parseProductIds("")).toThrow();
    });

    test("refuse plus de vingt identifiants", () => {
        expect(parseProductIds(Array.from({length: 20}, (_, n) => id(n + 1)).join(','))).toHaveLength(20);
        expect(() => parseProductIds(Array.from({length: 21}, (_, n) => id(n + 1)).join(','))).toThrow();
    });
});

describe('indexAttributes', () => {
    test("indexe les valeurs par code d'attribut et omet les champs vides", () => {
        expect(indexAttributes([
            {value: 'AM5', values: [], numericValue: null, categoryAttribute: {attribute: {code: 'socket'}}},
            {value: '120', values: [], numericValue: 120, categoryAttribute: {attribute: {code: 'tdp'}}},
            {value: 'ATX, Micro-ATX', values: ['ATX', 'Micro-ATX'], numericValue: null, categoryAttribute: {attribute: {code: 'form_factors_supported'}}},
        ])).toEqual({
            socket: {value: 'AM5'},
            tdp: {value: '120', numericValue: 120},
            form_factors_supported: {value: 'ATX, Micro-ATX', values: ['ATX', 'Micro-ATX']},
        });
    });
});
