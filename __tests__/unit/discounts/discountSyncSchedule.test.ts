/**
 * @jest-environment node
 */
// La synchronisation des remises tourne dans le processus de l'API, lancée par instrumentation.ts au démarrage
import {afterEach, describe, expect, jest, test} from '@jest/globals';
import {DISCOUNT_SYNC_INTERVAL_MS, startDiscountSync, stopDiscountSync} from "@/lib/discounts/discount-sync-schedule";

afterEach(() => {
    stopDiscountSync();
    jest.useRealTimers();
});

describe("startDiscountSync", () => {
    test("synchronise au démarrage, pour rattraper un arrêt, puis toutes les 5 minutes", async () => {
        jest.useFakeTimers();
        const sync = jest.fn(async () => undefined);

        startDiscountSync(sync);
        await jest.advanceTimersByTimeAsync(0);
        expect(sync).toHaveBeenCalledTimes(1);

        await jest.advanceTimersByTimeAsync(DISCOUNT_SYNC_INTERVAL_MS);
        expect(sync).toHaveBeenCalledTimes(2);
    });

    test("ne démarre qu'une fois par processus, même si register() est appelé deux fois", async () => {
        jest.useFakeTimers();
        const sync = jest.fn(async () => undefined);

        expect(startDiscountSync(sync)).toBe(true);
        expect(startDiscountSync(sync)).toBe(false);
        await jest.advanceTimersByTimeAsync(DISCOUNT_SYNC_INTERVAL_MS);

        expect(sync).toHaveBeenCalledTimes(2);
    });

    test("ne lance pas un passage tant que le précédent n'est pas fini", async () => {
        jest.useFakeTimers();
        const sync = jest.fn(() => new Promise<void>(() => undefined));

        startDiscountSync(sync);
        await jest.advanceTimersByTimeAsync(3 * DISCOUNT_SYNC_INTERVAL_MS);

        expect(sync).toHaveBeenCalledTimes(1);
    });

    test("continue après un passage en échec", async () => {
        jest.useFakeTimers();
        const consoleError = jest.spyOn(console, "error").mockImplementation(() => undefined);
        const sync = jest.fn<() => Promise<void>>()
            .mockRejectedValueOnce(new Error("base injoignable"))
            .mockResolvedValue(undefined);

        startDiscountSync(sync);
        await jest.advanceTimersByTimeAsync(DISCOUNT_SYNC_INTERVAL_MS);

        expect(sync).toHaveBeenCalledTimes(2);
        expect(consoleError).toHaveBeenCalledWith("[DISCOUNT SYNC]", "base injoignable");
        consoleError.mockRestore();
    });
});
