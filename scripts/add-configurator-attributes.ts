// Ajoute au catalogue les attributs qui manquaient aux règles du configurateur de la boutique : ddr_type sur les
// cartes mères, ddr_supported et cooler_included sur les processeurs, power_draw sur les cartes graphiques,
// form_factors_supported sur les boîtiers. Valeurs et sources : scripts/configurator-attributes.json.
// Les attributs absents sont créés et liés à leur catégorie, puis chaque produit reçoit sa valeur (créée ou remplacée).
// Rien n'est écrit si un produit du fichier est introuvable dans la catégorie de l'attribut, ou si un produit de la
// catégorie, actif ou non, reste sans valeur : un attribut absent rendrait le produit incompatible dans le configurateur.
// Simulation par défaut, --apply pour écrire.
// Usage (client Prisma généré depuis le schéma du configurateur, depuis la racine du projet) :
//   node --env-file=.env --import tsx scripts/add-configurator-attributes.ts [--apply]
import {readFileSync} from "node:fs";
import {AttributeType} from "@prisma/client";
import {db} from "@/lib/db";
import {typedAttributeValue} from "@/lib/api/attribute-values";

type AttributeSpec = {code: string; category: string; name?: string; type?: AttributeType};
type ProductEntry = Record<string, unknown> & {source?: string; verified?: string[]; note?: string};
type Plan = {
    spec: AttributeSpec;
    type: AttributeType;
    attributeId: string | null;
    categoryId: string;
    linkId: string | null;
    values: {productId: string; slug: string; raw: unknown}[];
};

const PROVENANCE_KEYS = new Set(["source", "verified", "note"]);
const apply = process.argv.includes("--apply");
const data = JSON.parse(readFileSync("scripts/configurator-attributes.json", "utf8")) as {
    attributes: AttributeSpec[];
    products: Record<string, ProductEntry>;
};

async function prepare(problems: string[]): Promise<Plan[]> {
    const plans: Plan[] = [];
    for (const spec of data.attributes) {
        const category = await db.categories.findUnique({
            where: {slug: spec.category},
            select: {id: true, Products: {select: {id: true, slug: true}}},
        });
        if (!category) {
            problems.push(`catégorie ${spec.category} introuvable`);
            continue;
        }

        const attribute = await db.attributes.findUnique({where: {code: spec.code}, select: {id: true, type: true}});
        const type = attribute?.type ?? spec.type;
        if (!type || (!attribute && !spec.name)) {
            problems.push(`${spec.code} : attribut absent, sans libellé ni type pour le créer`);
            continue;
        }
        if (attribute && spec.type && attribute.type !== spec.type) {
            problems.push(`${spec.code} : type ${attribute.type} en base, ${spec.type} attendu`);
        }

        const link = attribute
            ? await db.categoryAttributes.findUnique({
                where: {categoryId_attributeId: {categoryId: category.id, attributeId: attribute.id}},
                select: {id: true},
            })
            : null;

        const values: Plan["values"] = [];
        for (const product of category.Products) {
            const raw = data.products[product.slug]?.[spec.code];
            if (raw === undefined) {
                problems.push(`${spec.code} : aucune valeur pour ${product.slug}`);
            } else {
                values.push({productId: product.id, slug: product.slug, raw});
            }
        }

        plans.push({spec, type, attributeId: attribute?.id ?? null, categoryId: category.id, linkId: link?.id ?? null, values});
    }

    // Une valeur du fichier qui ne trouverait pas son produit serait perdue sans bruit
    for (const [slug, entry] of Object.entries(data.products)) {
        for (const code of Object.keys(entry).filter((key) => !PROVENANCE_KEYS.has(key))) {
            const plan = plans.find((candidate) => candidate.spec.code === code);
            if (!plan) {
                problems.push(`${slug} : ${code} n'est pas dans la liste des attributs`);
            } else if (!plan.values.some((value) => value.slug === slug)) {
                problems.push(`${slug} : introuvable dans ${plan.spec.category}`);
            }
        }
    }

    return plans;
}

async function linkToCategory(categoryId: string, attributeId: string): Promise<string> {
    const last = await db.categoryAttributes.findFirst({where: {categoryId}, orderBy: {displayOrder: "desc"}, select: {displayOrder: true}});
    const link = await db.categoryAttributes.create({
        data: {categoryId, attributeId, displayOrder: (last?.displayOrder ?? 0) + 1},
        select: {id: true},
    });

    return link.id;
}

async function write(plan: Plan): Promise<void> {
    const attributeId = plan.attributeId
        ?? (await db.attributes.create({data: {code: plan.spec.code, name: plan.spec.name ?? plan.spec.code, type: plan.type}, select: {id: true}})).id;
    const linkId = plan.linkId ?? await linkToCategory(plan.categoryId, attributeId);

    for (const {productId, raw} of plan.values) {
        const row = typedAttributeValue(productId, linkId, raw, plan.type);
        const fields = {value: row.value, numericValue: row.numericValue ?? null, values: row.values ?? []};
        await db.productAttributeValues.upsert({
            where: {productId_categoryAttributeId: {productId, categoryAttributeId: linkId}},
            create: {productId, categoryAttributeId: linkId, ...fields},
            update: fields,
        });
    }
}

async function main(): Promise<number> {
    const database = decodeURIComponent(new URL(process.env.DATABASE_URL ?? "mongodb://absente/").pathname.slice(1));
    console.log(`Base visée : ${database}`);

    const problems: string[] = [];
    const plans = await prepare(problems);
    for (const plan of plans) {
        console.log(`${plan.spec.code} (${plan.type}) sur ${plan.spec.category} : attribut ${plan.attributeId ? "existant" : "à créer"}, lien ${plan.linkId ? "existant" : "à créer"}, ${plan.values.length} valeur(s)`);
    }

    if (problems.length) {
        problems.forEach((problem) => console.log(`  problème : ${problem}`));
        console.log("Rien n'est écrit.");
        return 1;
    }
    if (!apply) {
        console.log("Simulation : relancer avec --apply pour écrire.");
        return 0;
    }

    for (const plan of plans) {
        await write(plan);
        console.log(`${plan.spec.code} : ${plan.values.length} valeur(s) écrite(s)`);
    }

    return 0;
}

main()
    .then((failures) => {
        process.exitCode = failures;
    })
    .finally(() => db.$disconnect());
