/**
 * @jest-environment node
 */
// Deux écritures simultanées du même document dans des transactions MongoDB : Prisma annule l'une d'elles (P2034).
// Rien n'a été écrit et le client peut recharger puis recommencer : c'est un conflit, pas une erreur interne
import {describe, expect, jest, test} from '@jest/globals';
import {Prisma} from "@prisma/client";
import {handleApiError} from "@/lib/api/handle-api-error";

describe("handleApiError", () => {
    test("répond 409 à un conflit d'écriture entre deux transactions", async () => {
        const error = new Prisma.PrismaClientKnownRequestError(
            "Transaction failed due to a write conflict or a deadlock. Please retry your transaction",
            {code: "P2034", clientVersion: Prisma.prismaVersion.client},
        );

        const response = handleApiError("STOCK PATCH", error);

        expect(response.status).toBe(409);
        expect(await response.json()).toMatchObject({code: "CONFLICT"});
    });

    test("garde une réponse générique pour une erreur inattendue", async () => {
        const consoleError = jest.spyOn(console, "error").mockImplementation(() => undefined);

        const response = handleApiError("STOCK PATCH", new Error("connexion perdue"));

        expect(response.status).toBe(500);
        expect(await response.json()).toEqual({error: "Erreur interne", code: "INTERNAL_ERROR"});
        consoleError.mockRestore();
    });
});
