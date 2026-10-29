/**
 * @jest-environment node
 */
import {describe, expect, test} from '@jest/globals';
import {createRateLimiter} from "@/lib/rate-limit";

const MINUTE = 60_000;

// Horloge réglée à la main : chaque test fixe l'instant de ses requêtes
const clock = (start = 0) => {
    let current = start;
    return {now: () => current, set: (time: number) => { current = time; }};
};

describe('createRateLimiter', () => {
    test("laisse passer la limite, puis refuse la requête suivante", async () => {
        const limiter = createRateLimiter({limit: 3, windowMs: MINUTE, now: clock().now});

        const results = [];
        for (let i = 0; i < 4; i++) results.push((await limiter.limit("203.0.113.7")).success);

        expect(results).toEqual([true, true, true, false]);
    });

    test("libère une place quand la plus ancienne requête sort de la fenêtre glissante", async () => {
        const time = clock();
        const limiter = createRateLimiter({limit: 2, windowMs: MINUTE, now: time.now});

        await limiter.limit("ip");
        time.set(30_000);
        await limiter.limit("ip");
        time.set(59_999);
        expect((await limiter.limit("ip")).success).toBe(false);

        // La requête de l'instant 0 sort de la fenêtre, celle de 30 s compte encore
        time.set(MINUTE);
        expect((await limiter.limit("ip")).success).toBe(true);
        expect((await limiter.limit("ip")).success).toBe(false);
    });

    test("compte chaque clé séparément", async () => {
        const limiter = createRateLimiter({limit: 1, windowMs: MINUTE, now: clock().now});

        expect((await limiter.limit("a")).success).toBe(true);
        expect((await limiter.limit("b")).success).toBe(true);
        expect((await limiter.limit("a")).success).toBe(false);
    });

    test("ne compte pas les requêtes refusées", async () => {
        const time = clock();
        const limiter = createRateLimiter({limit: 1, windowMs: MINUTE, now: time.now});

        await limiter.limit("ip");
        time.set(10_000);
        expect((await limiter.limit("ip")).success).toBe(false);

        // Une requête refusée ne repousse pas la libération de la place
        time.set(MINUTE);
        expect((await limiter.limit("ip")).success).toBe(true);
    });

    test("renvoie le nombre de requêtes restantes et l'instant de libération, comme Upstash", async () => {
        const time = clock(1_000);
        const limiter = createRateLimiter({limit: 2, windowMs: MINUTE, now: time.now});

        expect(await limiter.limit("ip")).toEqual({success: true, limit: 2, remaining: 1, reset: 61_000});
        time.set(21_000);
        expect(await limiter.limit("ip")).toEqual({success: true, limit: 2, remaining: 0, reset: 61_000});
        expect(await limiter.limit("ip")).toEqual({success: false, limit: 2, remaining: 0, reset: 61_000});
    });

    test("oublie les clés dont toutes les requêtes ont expiré", async () => {
        const time = clock();
        const store = new Map<string, number[]>();
        const limiter = createRateLimiter({limit: 10, windowMs: MINUTE, now: time.now, store});

        await limiter.limit("ancienne");
        time.set(MINUTE + 1);
        await limiter.limit("nouvelle");

        expect([...store.keys()]).toEqual(["nouvelle"]);
    });
});
