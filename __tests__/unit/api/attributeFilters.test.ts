import {describe, expect, test} from '@jest/globals';
import {buildAttributeWhere, parseAttributeFilters} from "@/lib/api/filters";

const parse = (query: string) => parseAttributeFilters(new URLSearchParams(query));
const attribute = (code: string) => ({categoryAttribute: {attribute: {code}}});

describe('parseAttributeFilters', () => {
    test("lit les quatre filtres d'attributs et ignore les autres paramètres", () => {
        expect(parse("attr[socket]=AM5&attrHas[form_factors_supported]=ATX&attrMin[psu_power]=676&attrMax[tdp]=150&page=2")).toEqual([
            {kind: 'attr', code: 'socket', values: ['AM5']},
            {kind: 'attrHas', code: 'form_factors_supported', values: ['ATX']},
            {kind: 'attrMin', code: 'psu_power', value: 676},
            {kind: 'attrMax', code: 'tdp', value: 150},
        ]);
    });

    test("accepte une liste de valeurs séparées par des virgules", () => {
        expect(parse("attr[ddr_type]=DDR4,DDR5")).toEqual([{kind: 'attr', code: 'ddr_type', values: ['DDR4', 'DDR5']}]);
    });

    test("refuse un code d'attribut mal formé", () => {
        expect(() => parse("attr[Socket]=AM5")).toThrow();
        expect(() => parse("attr[]=AM5")).toThrow();
        expect(() => parse("attr[socket;drop]=AM5")).toThrow();
    });

    test("refuse un filtre sans valeur et une borne qui n'est pas un nombre", () => {
        expect(() => parse("attr[socket]=")).toThrow();
        expect(() => parse("attrMin[psu_power]=beaucoup")).toThrow();
    });
});

describe('buildAttributeWhere', () => {
    test("ne filtre rien sans filtre d'attribut", () => {
        expect(buildAttributeWhere([])).toEqual({});
    });

    test("traduit chaque filtre en condition sur les valeurs d'attributs du produit", () => {
        expect(buildAttributeWhere([
            {kind: 'attr', code: 'socket', values: ['AM5']},
            {kind: 'attrHas', code: 'sockets_supported', values: ['AM5']},
            {kind: 'attrMin', code: 'psu_power', value: 676},
            {kind: 'attrMax', code: 'tdp', value: 150},
        ])).toEqual({
            AND: [
                {productAttributeValues: {some: {...attribute('socket'), value: {in: ['AM5']}}}},
                {productAttributeValues: {some: {...attribute('sockets_supported'), values: {hasEvery: ['AM5']}}}},
                {productAttributeValues: {some: {...attribute('psu_power'), numericValue: {gte: 676}}}},
                {productAttributeValues: {some: {...attribute('tdp'), numericValue: {lte: 150}}}},
            ],
        });
    });
});
