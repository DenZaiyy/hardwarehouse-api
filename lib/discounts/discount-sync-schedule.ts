import {syncDiscountedPrices} from "@/lib/discounts/sync-discounted-prices";

/** Rythme de la synchronisation, aligné sur le cache de 300 s des lectures de la boutique. */
export const DISCOUNT_SYNC_INTERVAL_MS = 5 * 60 * 1000;

/** Passage par défaut : une ligne dans les journaux de PM2 seulement quand des prix ont changé. */
async function syncAndReport(): Promise<void> {
    const rewritten = await syncDiscountedPrices();
    if (rewritten > 0) {
        console.log(`[DISCOUNT SYNC] ${rewritten} produit(s) recalculé(s)`);
    }
}

// Sur globalThis : register() peut être appelé deux fois dans un même processus (serveur et proxy), et le
// rechargement à chaud de next dev réévalue les modules
const state = globalThis as typeof globalThis & { discountSyncTimer?: ReturnType<typeof setInterval> };

/**
 * Lance la synchronisation des prix remisés au démarrage du serveur (instrumentation.ts), puis à intervalle régulier.
 * Le passage du démarrage rattrape les périodes commencées ou finies pendant un arrêt. Un passage n'en double jamais un
 * autre encore en cours, et une erreur est journalisée sans arrêter les suivants.
 * @returns false si la synchronisation tournait déjà dans ce processus
 */
export function startDiscountSync(
    sync: () => Promise<unknown> = syncAndReport,
    intervalMs: number = DISCOUNT_SYNC_INTERVAL_MS,
): boolean {
    if (state.discountSyncTimer) {
        return false;
    }

    let running = false;
    const run = async () => {
        if (running) return;

        running = true;
        try {
            await sync();
        } catch (error) {
            console.error("[DISCOUNT SYNC]", error instanceof Error ? error.message : error);
        } finally {
            running = false;
        }
    };

    const timer = setInterval(() => void run(), intervalMs);
    // Le minuteur ne retient jamais un processus qui s'arrête : le serveur HTTP suffit à garder l'API en vie
    timer.unref?.();
    state.discountSyncTimer = timer;

    void run();
    return true;
}

export function stopDiscountSync(): void {
    if (state.discountSyncTimer) {
        clearInterval(state.discountSyncTimer);
        state.discountSyncTimer = undefined;
    }
}
