import {db} from "@/lib/db";
import {refreshProductDiscount} from "@/lib/discounts/refresh-product-discount";

async function syncDiscounts() {
    const now = new Date();
    console.log(`[${now.toISOString()}] Sync discounts...`);

    const [toExpire, toActivate] = await Promise.all([
        // Remises à expirer : actives dont la endDate est dépassée
        db.discounts.findMany({
            where: {
                active: true,
                endDate: { lt: now }
            },
            select: {
                id: true,
                productId: true,
                category: { select: { Products: { select: { id: true } } } },
            },
        }),
        db.discounts.findMany({
            where: {
                active: false,
                startDate: { lte: now },
                OR: [
                    { endDate: null },
                    { endDate: { gte: now } }   // ← guard manquant
                ]
            },
            select: {
                id: true,
                productId: true,
                category: { select: { Products: { select: { id: true } } } },
            },
        }),
    ]);

    if (toExpire.length === 0 && toActivate.length === 0) {
        console.log("Rien à synchroniser.");
        return;
    }

    // 1. Mise à jour des statuts dans la transaction (rapide)
    await db.$transaction(async (tx) => {
        if (toExpire.length > 0) {
            await tx.discounts.updateMany({
                where: { id: { in: toExpire.map((d) => d.id) } },
                data: { active: false },
            });
        }
        if (toActivate.length > 0) {
            await tx.discounts.updateMany({
                where: { id: { in: toActivate.map((d) => d.id) } },
                data: { active: true },
            });
        }
    });

    // 2. Refresh des prix HORS transaction — pas de timeout risk
    const productIds = new Set<string>();
    for (const discount of [...toExpire, ...toActivate]) {
        if (discount.productId) productIds.add(discount.productId);
        for (const p of discount.category?.Products ?? []) {
            productIds.add(p.id);
        }
    }

    // Parallel au lieu de séquentiel
    await Promise.all(
        [...productIds].map((productId) => refreshProductDiscount(db, productId))
    );

    console.log(`Expiré: ${toExpire.length} | Activé: ${toActivate.length}`);
}

const INTERVAL_MS = 1 * 60 * 1000; // 15 minutes

async function run() {
    while (true) {
        try {
            await syncDiscounts();
        } catch (error) {
            console.error("[CRON ERROR]", error);
        }
        await new Promise((resolve) => setTimeout(resolve, INTERVAL_MS));
    }
}

run();