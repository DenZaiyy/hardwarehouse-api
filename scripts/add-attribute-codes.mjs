// Prépare les données au schéma du configurateur, AVANT `npx prisma db push` : l'index unique de Attributes.code
// échouerait sur des documents sans code. Le script :
// - attribue à chaque attribut le code de prisma/attribute-codes.js, d'après son libellé et sa catégorie ;
// - renseigne numericValue des valeurs d'attributs NUMBER (MongoDB compare « 650 » et « 1000 » comme du texte) ;
// - initialise values à une liste vide là où le champ manque.
// Rien n'est écrit si deux attributs recevraient le même code. Simulation par défaut, --apply pour écrire.
// Usage (client Prisma généré depuis le nouveau schéma) :
//   node --env-file=.env --env-file=.env.local scripts/add-attribute-codes.mjs [--apply]
import {createRequire} from "node:module";
import {PrismaClient} from "@prisma/client";

const {attributeCode} = createRequire(import.meta.url)("../prisma/attribute-codes.js");
const apply = process.argv.includes("--apply");
const db = new PrismaClient();

const isNumber = (value) => value.trim() !== "" && Number.isFinite(Number(value));

try {
    // Sans sélectionner code : le nouveau client refuserait un champ obligatoire encore absent
    const attributes = await db.attributes.findMany({
        select: {id: true, name: true, categoryAttributes: {select: {category: {select: {slug: true}}}}},
        orderBy: {name: "asc"},
    });
    const assigned = attributes.map((attribute) => {
        const [firstCategory = ""] = attribute.categoryAttributes.map(({category}) => category.slug).sort();
        return {attribute, code: attributeCode(attribute.name, firstCategory)};
    });
    const duplicates = [...Map.groupBy(assigned, ({code}) => code)].filter(([, list]) => list.length > 1);

    const numbers = await db.productAttributeValues.findMany({
        where: {categoryAttribute: {attribute: {type: "NUMBER"}}},
        select: {id: true, value: true, numericValue: true},
    });
    const toFill = numbers.filter((row) => row.numericValue === null && isNumber(row.value));
    const unreadable = numbers.filter((row) => row.numericValue === null && !isNumber(row.value));

    assigned.forEach(({attribute, code}) => console.log(`  ${attribute.name} → ${code}`));
    console.log(`${assigned.length} attributs, ${toFill.length} valeur(s) numérique(s) à renseigner, ${unreadable.length} illisible(s)`);
    unreadable.forEach((row) => console.log(`  valeur NUMBER illisible : ${row.id} « ${row.value} »`));

    if (duplicates.length) {
        duplicates.forEach(([code, list]) => console.log(`  code en double : ${code} (${list.map(({attribute}) => attribute.name).join(", ")})`));
        console.log("Codes en double : rien n'est écrit.");
        process.exitCode = 1;
    } else if (apply) {
        // Commandes MongoDB brutes : une seule requête par collection, quel que soit le client Prisma en place
        await db.$runCommandRaw({
            update: "Attributes",
            updates: assigned.map(({attribute, code}) => ({q: {_id: {$oid: attribute.id}}, u: {$set: {code}}})),
        });
        if (toFill.length) {
            await db.$runCommandRaw({
                update: "ProductAttributeValues",
                updates: toFill.map((row) => ({q: {_id: {$oid: row.id}}, u: {$set: {numericValue: Number(row.value)}}})),
            });
        }
        await db.$runCommandRaw({
            update: "ProductAttributeValues",
            updates: [{q: {values: {$exists: false}}, u: {$set: {values: []}}, multi: true}],
        });
        console.log("Écrit. Lancer ensuite npx prisma db push, qui crée l'index unique des codes.");
    } else {
        console.log("Simulation : relancer avec --apply pour écrire.");
    }
} finally {
    await db.$disconnect();
}
