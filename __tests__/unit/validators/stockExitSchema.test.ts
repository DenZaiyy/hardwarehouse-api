import {describe, expect, test} from '@jest/globals';
import {stockExitSchema} from "@/lib/validators/stockExitSchema";

const line = (productId: string, quantity: number) => ({productId, quantity});

describe('stockExitSchema', () => {
    test("accepte une commande et ses lignes", () => {
        const result = stockExitSchema.safeParse({
            orderReference: "ORD20261006AE241F86",
            lines: [line("65f0c0ffee0000000000aa01", 2), line("65f0c0ffee0000000000aa02", 1)],
        });

        expect(result.success).toBe(true);
    });

    test("refuse une quantité nulle ou négative", () => {
        for (const quantity of [0, -1]) {
            expect(stockExitSchema.safeParse({orderReference: "ORD1", lines: [line("65f0c0ffee0000000000aa01", quantity)]}).success).toBe(false);
        }
    });

    test("refuse une quantité décimale", () => {
        expect(stockExitSchema.safeParse({orderReference: "ORD1", lines: [line("65f0c0ffee0000000000aa01", 1.5)]}).success).toBe(false);
    });

    test("refuse un identifiant de produit invalide", () => {
        expect(stockExitSchema.safeParse({orderReference: "ORD1", lines: [line("pas-un-object-id", 1)]}).success).toBe(false);
    });

    test("refuse une commande sans ligne", () => {
        expect(stockExitSchema.safeParse({orderReference: "ORD1", lines: []}).success).toBe(false);
    });

    test("refuse un produit présent deux fois", () => {
        const result = stockExitSchema.safeParse({
            orderReference: "ORD1",
            lines: [line("65f0c0ffee0000000000aa01", 1), line("65f0c0ffee0000000000aa01", 2)],
        });

        expect(result.success).toBe(false);
    });

    test("refuse une référence de commande vide", () => {
        expect(stockExitSchema.safeParse({orderReference: "  ", lines: [line("65f0c0ffee0000000000aa01", 1)]}).success).toBe(false);
    });
});
