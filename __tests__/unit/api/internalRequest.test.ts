/**
 * @jest-environment node
 */
// Le secret ne sert qu'au back-office : ses services l'envoient, ses routes de liste le vérifient
import {afterEach, describe, expect, test} from '@jest/globals';
import {NextRequest} from "next/server";
import {internalRequestHeaders, isInternalRequest} from "@/lib/api/internal-request";

const request = (headers: Record<string, string> = {}) =>
    new NextRequest("https://api.example.com/api/v1/products", {headers});

afterEach(() => {
    delete process.env.INTERNAL_API_SECRET;
});

describe('internalRequestHeaders', () => {
    test("ajoute le secret aux appels du back-office", () => {
        process.env.INTERNAL_API_SECRET = "secret-de-test";

        expect(internalRequestHeaders()).toEqual({"x-internal-request": "secret-de-test"});
    });

    test("échoue avec un message clair quand le secret manque, au lieu de laisser tronquer les listes", () => {
        expect(() => internalRequestHeaders()).toThrow(/INTERNAL_API_SECRET/);

        process.env.INTERNAL_API_SECRET = "";
        expect(() => internalRequestHeaders()).toThrow(/INTERNAL_API_SECRET/);
    });
});

describe('isInternalRequest', () => {
    test("reconnaît un appel qui porte le secret", () => {
        process.env.INTERNAL_API_SECRET = "secret-de-test";

        expect(isInternalRequest(request({"x-internal-request": "secret-de-test"}))).toBe(true);
    });

    test("traite comme public un appel sans le secret, comme ceux de la boutique", () => {
        process.env.INTERNAL_API_SECRET = "secret-de-test";

        expect(isInternalRequest(request())).toBe(false);
        expect(isInternalRequest(request({"x-internal-request": "autre"}))).toBe(false);
    });

    test("ne reconnaît aucun appel tant que le secret n'est pas configuré", () => {
        expect(isInternalRequest(request({"x-internal-request": "undefined"}))).toBe(false);

        process.env.INTERNAL_API_SECRET = "";
        expect(isInternalRequest(request({"x-internal-request": ""}))).toBe(false);
    });
});
