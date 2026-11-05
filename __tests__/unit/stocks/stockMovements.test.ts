/**
 * @jest-environment node
 */
// Chaque changement de quantité d'un stock laisse un mouvement, écrit dans la même transaction, et ne s'applique
// que sur la quantité lue par le serveur : la quantité affichée et l'historique des mouvements ne divergent pas
import {describe, expect, test} from '@jest/globals';
import {Prisma} from "@prisma/client";
import {BadRequestError, ConflictError} from "@/lib/api/errors";
import {applyManualMovement, changeStockQuantity, recordStockMovement} from "@/lib/stocks/stock-movements";

type StockRow = { id: string; productId: string; quantity: number; minQuantity: number };
type Movement = {
    type: boolean;
    oldQtt: number;
    newQtt: number;
    userId: string | null;
    userFullName: string;
    product: { connect: { id: string } };
};

const author = {userId: "user_staff", userFullName: "Jeanne Martin"};

/** Client de transaction en mémoire, limité aux opérations de Prisma dont le module se sert. Comme Prisma, il rend des copies. */
function fakeDatabase(initial: StockRow[] = []) {
    const stocks = initial.map((stock) => ({...stock}));
    const movements: Movement[] = [];

    const tx = {
        stocks: {
            findUnique: async ({where}: { where: { id?: string; productId?: string } }) => {
                const stock = stocks.find((candidate) => where.id !== undefined ? candidate.id === where.id : candidate.productId === where.productId);
                return stock ? {...stock} : null;
            },
            updateMany: async ({where, data}: { where: { id: string; quantity: number }; data: { quantity: number } }) => {
                const stock = stocks.find((candidate) => candidate.id === where.id && candidate.quantity === where.quantity);
                if (!stock) return {count: 0};

                stock.quantity = data.quantity;
                return {count: 1};
            },
            create: async ({data}: { data: { productId: string; quantity: number } }) => {
                const stock = {id: `stock-${stocks.length + 1}`, minQuantity: 0, ...data};
                stocks.push(stock);
                return stock;
            },
        },
        transactions: {
            create: async ({data}: { data: Movement }) => {
                movements.push(data);
                return {id: `movement-${movements.length}`, ...data};
            },
        },
    };

    return {tx: tx as unknown as Prisma.TransactionClient, stocks, movements};
}

const stockOf = (quantity: number): StockRow => ({id: "stock-1", productId: "product-1", quantity, minQuantity: 2});

describe("changeStockQuantity", () => {
    test("écrit la nouvelle quantité et le mouvement d'entrée qui l'explique", async () => {
        const {tx, stocks, movements} = fakeDatabase([stockOf(10)]);

        await changeStockQuantity(tx, stockOf(10), 15, author);

        expect(stocks[0].quantity).toBe(15);
        expect(movements).toEqual([{
            type: true,
            oldQtt: 10,
            newQtt: 15,
            userId: "user_staff",
            userFullName: "Jeanne Martin",
            product: {connect: {id: "product-1"}},
        }]);
    });

    test("enregistre une sortie quand la quantité baisse", async () => {
        const {tx, movements} = fakeDatabase([stockOf(10)]);

        await changeStockQuantity(tx, stockOf(10), 4, author);

        expect(movements[0]).toMatchObject({type: false, oldQtt: 10, newQtt: 4});
    });

    test("refuse d'écraser une quantité modifiée entre la lecture et l'écriture", async () => {
        // Une commande payée est sortie du stock pendant que la quantité était corrigée
        const {tx, stocks, movements} = fakeDatabase([stockOf(8)]);

        await expect(changeStockQuantity(tx, stockOf(10), 15, author)).rejects.toBeInstanceOf(ConflictError);
        expect(stocks[0].quantity).toBe(8);
        expect(movements).toEqual([]);
    });

    test("n'écrit rien quand la quantité ne change pas", async () => {
        const {tx, movements} = fakeDatabase([stockOf(10)]);

        await expect(changeStockQuantity(tx, stockOf(10), 10, author)).resolves.toBeNull();
        expect(movements).toEqual([]);
    });
});

describe("recordStockMovement", () => {
    test("trace l'ouverture d'un stock comme une entrée depuis zéro", async () => {
        const {tx, movements} = fakeDatabase();

        await recordStockMovement(tx, {productId: "product-1", oldQuantity: 0, newQuantity: 12}, author);

        expect(movements).toEqual([{
            type: true,
            oldQtt: 0,
            newQtt: 12,
            userId: "user_staff",
            userFullName: "Jeanne Martin",
            product: {connect: {id: "product-1"}},
        }]);
    });
});

describe("applyManualMovement", () => {
    test("ajoute la quantité entrée au stock lu par le serveur", async () => {
        const {tx, stocks, movements} = fakeDatabase([stockOf(10)]);

        await applyManualMovement(tx, {productId: "product-1", type: true, expectedQuantity: 10, movedQuantity: 5}, author);

        expect(stocks[0].quantity).toBe(15);
        expect(movements[0]).toMatchObject({type: true, oldQtt: 10, newQtt: 15});
    });

    test("refuse un formulaire ouvert avant un autre mouvement, ce qui arrête aussi un double envoi", async () => {
        const {tx, stocks, movements} = fakeDatabase([stockOf(15)]);

        await expect(applyManualMovement(tx, {productId: "product-1", type: true, expectedQuantity: 10, movedQuantity: 5}, author))
            .rejects.toBeInstanceOf(ConflictError);
        expect(stocks[0].quantity).toBe(15);
        expect(movements).toEqual([]);
    });

    test("refuse une sortie plus grande que le stock", async () => {
        const {tx, stocks, movements} = fakeDatabase([stockOf(3)]);

        await expect(applyManualMovement(tx, {productId: "product-1", type: false, expectedQuantity: 3, movedQuantity: 5}, author))
            .rejects.toBeInstanceOf(ConflictError);
        expect(stocks[0].quantity).toBe(3);
        expect(movements).toEqual([]);
    });

    test("ouvre le stock d'un produit qui n'en a pas encore", async () => {
        const {tx, stocks, movements} = fakeDatabase();

        await applyManualMovement(tx, {productId: "product-9", type: true, expectedQuantity: 0, movedQuantity: 7}, author);

        expect(stocks).toEqual([expect.objectContaining({productId: "product-9", quantity: 7})]);
        expect(movements[0]).toMatchObject({type: true, oldQtt: 0, newQtt: 7});
    });

    test("refuse un mouvement de quantité nulle", async () => {
        const {tx, movements} = fakeDatabase([stockOf(10)]);

        await expect(applyManualMovement(tx, {productId: "product-1", type: true, expectedQuantity: 10, movedQuantity: 0}, author))
            .rejects.toBeInstanceOf(BadRequestError);
        expect(movements).toEqual([]);
    });
});
