// Appelé une fois au démarrage du serveur Next.js (node_modules/next/dist/docs, instrumentation.md).
// La synchronisation des prix remisés vit dans le processus de l'API, que PM2 relance avec elle (B61) : pas de
// second processus ni de crontab à maintenir sur le VPS.
export async function register() {
    if (process.env.NEXT_RUNTIME !== "nodejs" || process.env.NEXT_PHASE === "phase-production-build") {
        return;
    }

    const {DISCOUNT_SYNC_INTERVAL_MS, startDiscountSync} = await import("./lib/discounts/discount-sync-schedule");
    if (startDiscountSync()) {
        console.log(`[DISCOUNT SYNC] lancée, puis toutes les ${DISCOUNT_SYNC_INTERVAL_MS / 60_000} minutes`);
    }
}
