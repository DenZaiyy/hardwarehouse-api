/**
 * @jest-environment node
 */
// La garde s'exécute côté serveur : Request et NextRequest n'existent pas dans jsdom
import {afterEach, describe, expect, test} from '@jest/globals';
import {NextRequest} from "next/server";
import {requireShop, tokensMatch} from "@/lib/auth/require-shop";

const request = (authorization?: string) => new NextRequest("https://api.example.com/api/v1/stock-exits", {
    method: "POST",
    headers: authorization ? {authorization} : {},
});

describe('requireShop', () => {
    afterEach(() => {
        delete process.env.SHOP_API_TOKEN;
    });

    test("laisse passer le jeton de la boutique", () => {
        process.env.SHOP_API_TOKEN = "jeton-de-test";

        expect(requireShop(request("Bearer jeton-de-test"))).toBeNull();
    });

    test("refuse un jeton différent ou absent", () => {
        process.env.SHOP_API_TOKEN = "jeton-de-test";

        expect(requireShop(request("Bearer autre-jeton"))?.status).toBe(401);
        expect(requireShop(request())?.status).toBe(401);
    });

    test("refuse tout tant qu'aucun jeton n'est configuré", () => {
        expect(requireShop(request("Bearer "))?.status).toBe(401);
    });
});

describe('tokensMatch', () => {
    test("compare des jetons de longueurs différentes sans erreur", () => {
        expect(tokensMatch("court", "beaucoup-plus-long")).toBe(false);
        expect(tokensMatch("identique", "identique")).toBe(true);
    });
});
