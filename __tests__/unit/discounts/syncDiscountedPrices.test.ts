/**
 * @jest-environment node
 */
// Le prix remisé est recopié sur le produit (discountPrice, discountAmount, promote) : il faut le recalculer quand une
// période de remise commence ou finit. La synchronisation ne touche jamais à l'interrupteur active d'une remise, que
// seul le back-office modifie : l'ancienne tâche rallumait une remise coupée à la main
import {describe, expect, test} from '@jest/globals';
import {Prisma} from "@prisma/client";
import {syncDiscountedPrices} from "@/lib/discounts/sync-discounted-prices";

type ProductRow = {
    id: string;
    price: number;
    categoryId: string;
    discountPrice: number | null;
    discountAmount: number | null;
    promote: boolean;
};
type DiscountRow = {
    id: string;
    productId: string | null;
    categoryId: string | null;
    discountAmount: number;
    discountType: "PERCENTAGE" | "FIXED";
    active: boolean;
    startDate: Date;
    endDate: Date | null;
};
type DiscountWhere = {
    productId?: string;
    categoryId?: string;
    active?: boolean;
    startDate?: { lte: Date };
    OR?: Array<{ endDate: null | { gte: Date } }>;
};

const now = new Date("2026-11-05T12:00:00Z");
const hours = (count: number) => new Date(now.getTime() + count * 3_600_000);

const product = (id: string, overrides: Partial<ProductRow> = {}): ProductRow =>
    ({id, price: 200, categoryId: "category-gpu", discountPrice: null, discountAmount: null, promote: false, ...overrides});
const discount = (id: string, overrides: Partial<DiscountRow>): DiscountRow =>
    ({id, productId: null, categoryId: null, discountAmount: 10, discountType: "PERCENTAGE", active: true, startDate: hours(-48), endDate: null, ...overrides});

/** Conditions de Prisma dont se servent la synchronisation et le recalcul d'un produit. */
function matches(row: DiscountRow, where: DiscountWhere): boolean {
    if (where.productId !== undefined && row.productId !== where.productId) return false;
    if (where.categoryId !== undefined && row.categoryId !== where.categoryId) return false;
    if (where.active !== undefined && row.active !== where.active) return false;
    if (where.startDate && row.startDate > where.startDate.lte) return false;

    return !where.OR || where.OR.some(({endDate}) =>
        endDate === null ? row.endDate === null : row.endDate !== null && row.endDate >= endDate.gte);
}

/** Catalogue en mémoire, limité aux opérations de Prisma utilisées. Garde la trace des produits réécrits. */
function fakeCatalogue(products: ProductRow[], discounts: DiscountRow[]) {
    const writes: string[] = [];

    const client = {
        products: {
            findMany: async ({where}: { where: { promote: boolean } }) =>
                products.filter((row) => row.promote === where.promote).map(({id}) => ({id})),
            findUnique: async ({where}: { where: { id: string } }) => {
                const row = products.find((candidate) => candidate.id === where.id);
                return row ? {...row} : null;
            },
            update: async ({where, data}: { where: { id: string }; data: Partial<ProductRow> }) => {
                const row = products.find((candidate) => candidate.id === where.id);
                if (!row) throw new Error(`Produit ${where.id} introuvable`);

                Object.assign(row, data);
                writes.push(row.id);
                return {...row};
            },
        },
        discounts: {
            findMany: async ({where}: { where: DiscountWhere }) => discounts.filter((row) => matches(row, where)).map((row) => ({
                productId: row.productId,
                category: row.categoryId === null ? null : {
                    Products: products.filter((candidate) => candidate.categoryId === row.categoryId).map(({id}) => ({id})),
                },
            })),
            findFirst: async ({where}: { where: DiscountWhere }) => discounts
                .filter((row) => matches(row, where))
                .sort((a, b) => b.startDate.getTime() - a.startDate.getTime())[0] ?? null,
        },
    };

    return {client: client as unknown as Prisma.TransactionClient, products, discounts, writes};
}

describe("syncDiscountedPrices", () => {
    test("rend son plein tarif à un produit dont la remise a pris fin", async () => {
        const {client, products, discounts} = fakeCatalogue(
            [product("p1", {discountPrice: 180, discountAmount: 10, promote: true})],
            [discount("d1", {productId: "p1", endDate: hours(-1)})],
        );

        await expect(syncDiscountedPrices(client, now)).resolves.toBe(1);

        expect(products[0]).toMatchObject({promote: false, discountPrice: null, discountAmount: null});
        expect(discounts[0].active).toBe(true);
    });

    test("laisse coupée une remise désactivée à la main pendant sa période", async () => {
        const {client, products, discounts} = fakeCatalogue(
            [product("p2")],
            [discount("d2", {productId: "p2", active: false, startDate: hours(-1), endDate: hours(24)})],
        );

        await syncDiscountedPrices(client, now);

        expect(discounts[0].active).toBe(false);
        expect(products[0].promote).toBe(false);
    });

    test("applique une remise programmée dès que sa date de début est passée", async () => {
        const {client, products} = fakeCatalogue(
            [product("p3", {price: 200})],
            [discount("d3", {categoryId: "category-gpu", discountAmount: 25, startDate: hours(-1)})],
        );

        await syncDiscountedPrices(client, now);

        expect(products[0]).toMatchObject({promote: true, discountPrice: 150, discountAmount: 25});
    });

    test("n'applique pas une remise dont la période n'a pas commencé", async () => {
        const {client, products} = fakeCatalogue(
            [product("p4")],
            [discount("d4", {productId: "p4", startDate: hours(2)})],
        );

        await syncDiscountedPrices(client, now);

        expect(products[0].promote).toBe(false);
    });

    test("ne réécrit pas un produit dont la remise en cours ne change pas", async () => {
        const {client, writes} = fakeCatalogue(
            [product("p5", {discountPrice: 180, discountAmount: 10, promote: true})],
            [discount("d5", {productId: "p5"})],
        );

        await expect(syncDiscountedPrices(client, now)).resolves.toBe(0);

        expect(writes).toEqual([]);
    });
});
