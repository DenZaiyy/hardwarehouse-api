// Catalogue resserré à 15 produits par catégorie (choix validé par Kevin le 29 octobre 2026, scripts/catalogue-selection.json).
// Les autres produits sont désactivés, jamais supprimés : l'historique (commandes, mouvements) reste intact et la
// sélection se rejoue ou s'annule (--reset réactive tout). Simulation par défaut, --apply pour écrire.
// Usage : node --env-file=.env --env-file=.env.local scripts/curate-catalogue.mjs [--apply] [--reset]
import {readFileSync} from "node:fs";
import {PrismaClient} from "@prisma/client";

const apply = process.argv.includes("--apply");
const reset = process.argv.includes("--reset");
const selection = JSON.parse(readFileSync(new URL("./catalogue-selection.json", import.meta.url), "utf8"));
const db = new PrismaClient();

try {
    const products = await db.products.findMany({select: {id: true, name: true, active: true, category: {select: {name: true}}}});
    const kept = new Set();
    const missing = [];

    for (const [category, names] of Object.entries(selection)) {
        for (const name of names) {
            const matches = products.filter((product) => product.category?.name === category && product.name === name);
            if (matches.length === 1) kept.add(matches[0].id);
            else missing.push(`${category} : « ${name} » (${matches.length} produit(s))`);
        }
    }

    const toActivate = products.filter((product) => (reset || kept.has(product.id)) && !product.active);
    const toDeactivate = reset ? [] : products.filter((product) => !kept.has(product.id) && product.active);
    console.log(`${products.length} produits, ${kept.size} retenus, ${missing.length} introuvable(s)`);
    missing.forEach((line) => console.log(`  introuvable : ${line}`));
    console.log(`à activer : ${toActivate.length}, à désactiver : ${toDeactivate.length}`);

    if (missing.length && !reset) {
        console.log("Sélection incomplète : rien n'est écrit.");
        process.exitCode = 1;
    } else if (apply) {
        await db.products.updateMany({where: {id: {in: toActivate.map((product) => product.id)}}, data: {active: true}});
        await db.products.updateMany({where: {id: {in: toDeactivate.map((product) => product.id)}}, data: {active: false}});
        console.log("Écrit.");
    } else {
        console.log("Simulation : relancer avec --apply pour écrire.");
    }
} finally {
    await db.$disconnect();
}
