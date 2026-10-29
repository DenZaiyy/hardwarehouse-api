// Limitation de débit en mémoire. L'API tourne en un seul processus Node sous PM2 (mode fork, une instance),
// dont la mémoire est partagée par toutes les requêtes : aucun service externe n'est nécessaire. Avec plusieurs
// instances, chacune aurait ses propres compteurs, et il faudrait un stockage partagé (Redis sur le VPS).

export type RateLimitResult = {
    success: boolean;
    limit: number;
    remaining: number;
    // Instant (en ms) où la plus ancienne requête comptée sort de la fenêtre et libère une place
    reset: number;
};

export type RateLimiter = {
    limit: (key: string) => Promise<RateLimitResult>;
};

type RateLimiterOptions = {
    limit: number;
    windowMs: number;
    now?: () => number;
    // Instants des requêtes acceptées, par clé, du plus ancien au plus récent
    store?: Map<string, number[]>;
};

// Fenêtre glissante exacte : une requête passe si moins de `limit` requêtes ont été acceptées
// pendant les `windowMs` dernières millisecondes. Les requêtes refusées ne comptent pas.
export function createRateLimiter({limit, windowMs, now = Date.now, store = new Map()}: RateLimiterOptions): RateLimiter {
    let lastSweep = now();

    // Une fois par fenêtre au plus, oublie les clés dont toutes les requêtes ont expiré : la mémoire reste bornée
    const sweep = (current: number) => {
        for (const [key, hits] of store) {
            if (hits[hits.length - 1] <= current - windowMs) store.delete(key);
        }
        lastSweep = current;
    };

    return {
        async limit(key) {
            const current = now();
            if (current - lastSweep >= windowMs) sweep(current);

            const hits = (store.get(key) ?? []).filter((time) => time > current - windowMs);
            const success = hits.length < limit;
            if (success) hits.push(current);
            store.set(key, hits);

            return {success, limit, remaining: limit - hits.length, reset: hits[0] + windowMs};
        },
    };
}

// Un seul compteur par processus, partagé par toutes les routes : rangé sur globalThis, comme le client Prisma
const globalForRateLimit = globalThis as unknown as { rateLimitStore?: Map<string, number[]> };
globalForRateLimit.rateLimitStore ??= new Map();

export const rateLimiter = createRateLimiter({
    limit: 10, // 10 requêtes par minute et par adresse IP
    windowMs: 60_000,
    store: globalForRateLimit.rateLimitStore,
});

// Clé du limiteur. Sur le VPS, Nginx écrit X-Real-IP avec l'adresse réelle du visiteur ($remote_addr, que real_ip tire
// de CF-Connecting-IP), et seul Cloudflare peut le joindre (certificat client exigé). X-Forwarded-For commence par ce
// que le client a envoyé : comme clé, il donnerait un compteur neuf à chaque requête. Les appels qui ne passent pas par
// Nginx (services du back-office par localhost, développement) partagent le compteur 127.0.0.1.
export function clientIp(request: Request): string {
    return request.headers.get("x-real-ip") || "127.0.0.1";
}
