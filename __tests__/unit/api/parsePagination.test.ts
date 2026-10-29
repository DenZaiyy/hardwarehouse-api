import {describe, expect, test} from '@jest/globals';
import {parsePagination} from "@/lib/api/filters";

const parse = (query: string) => parsePagination(new URLSearchParams(query));

describe('parsePagination', () => {
    test("donne la première page de 25 éléments par défaut", () => {
        expect(parse("")).toEqual({page: 1, limit: 25, skip: 0});
    });

    test("calcule le décalage de la page demandée", () => {
        expect(parse("page=3&limit=10")).toEqual({page: 3, limit: 10, skip: 20});
    });

    test("retombe sur les valeurs par défaut quand la page ou la limite n'est pas un nombre", () => {
        // parseInt('abc') donnait NaN, que Prisma refusait : la route répondait 500
        expect(parse("page=abc&limit=xyz")).toEqual({page: 1, limit: 25, skip: 0});
    });

    test("borne la page à 1 et la limite entre 1 et 50", () => {
        expect(parse("page=0&limit=500")).toEqual({page: 1, limit: 50, skip: 0});
        expect(parse("page=-4&limit=0")).toEqual({page: 1, limit: 1, skip: 0});
    });
});
