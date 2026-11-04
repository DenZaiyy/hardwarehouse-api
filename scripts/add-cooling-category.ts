// Crée la catégorie Refroidissement du configurateur de la boutique et ses ventirads, d'après
// scripts/cooling-catalogue.json : la catégorie, ses attributs (créés s'ils manquent, puis liés à la catégorie), les
// produits avec leur stock, puis la valeur de chaque attribut. Un produit déjà présent garde ses champs (un prix ou un
// stock modifié depuis le back-office n'est pas écrasé) : seules ses valeurs d'attributs sont réécrites. Les images
// passent ensuite par scripts/import-catalogue-images.ts. Simulation par défaut, --apply pour écrire.
// Usage (client Prisma généré depuis le schéma du configurateur, depuis la racine du projet) :
//   node --env-file=.env --import tsx scripts/add-cooling-category.ts [--apply]
import {readFileSync} from "node:fs";
import {AttributeType} from "@prisma/client";
import {db} from "@/lib/db";
import {typedAttributeValue} from "@/lib/api/attribute-values";

type AttributeSpec = {code: string; name?: string; type?: AttributeType};
type ProductSpec = {
    slug: string;
    name: string;
    sku: string;
    mpn: string;
    ean13: string;
    price: number;
    stock: number;
    minQuantity: number;
    shortDescription: string;
    description: string;
    source: string;
    attributes: Record<string, unknown>;
};
type Attribute = {spec: AttributeSpec; type: AttributeType; id: string | null};

const apply = process.argv.includes("--apply");
const data = JSON.parse(readFileSync("scripts/cooling-catalogue.json", "utf8")) as {
    category: {name: string; slug: string; logo: string};
    brand: string;
    attributes: AttributeSpec[];
    products: ProductSpec[];
};

async function linkToCategory(categoryId: string, attributeId: string): Promise<string> {
    const existing = await db.categoryAttributes.findUnique({
        where: {categoryId_attributeId: {categoryId, attributeId}},
        select: {id: true},
    });
    if (existing) return existing.id;

    const last = await db.categoryAttributes.findFirst({where: {categoryId}, orderBy: {displayOrder: "desc"}, select: {displayOrder: true}});
    const link = await db.categoryAttributes.create({
        data: {categoryId, attributeId, displayOrder: (last?.displayOrder ?? 0) + 1},
        select: {id: true},
    });

    return link.id;
}

async function main(): Promise<number> {
    const database = decodeURIComponent(new URL(process.env.DATABASE_URL ?? "mongodb://absente/").pathname.slice(1));
    console.log(`Base visée : ${database}`);
    const problems: string[] = [];

    const brand = await db.brands.findUnique({where: {slug: data.brand}, select: {id: true}});
    if (!brand) problems.push(`marque ${data.brand} introuvable`);
    const category = await db.categories.findUnique({where: {slug: data.category.slug}, select: {id: true}});

    const attributes: Attribute[] = [];
    for (const spec of data.attributes) {
        const existing = await db.attributes.findUnique({where: {code: spec.code}, select: {id: true, type: true}});
        const type = existing?.type ?? spec.type;
        if (!type || (!existing && !spec.name)) {
            problems.push(`${spec.code} : attribut absent, sans libellé ni type pour le créer`);
            continue;
        }
        if (existing && spec.type && existing.type !== spec.type) {
            problems.push(`${spec.code} : type ${existing.type} en base, ${spec.type} attendu`);
        }
        attributes.push({spec, type, id: existing?.id ?? null});
    }

    // Chaque produit renseigne chaque attribut : un attribut absent le rendrait incompatible dans le configurateur
    for (const product of data.products) {
        for (const attribute of attributes) {
            if (product.attributes[attribute.spec.code] === undefined) problems.push(`${product.slug} : ${attribute.spec.code} manquant`);
        }
        for (const code of Object.keys(product.attributes)) {
            if (!attributes.some((attribute) => attribute.spec.code === code)) problems.push(`${product.slug} : ${code} n'est pas dans la liste des attributs`);
        }
    }

    const existingProducts = await db.products.findMany({
        where: {slug: {in: data.products.map((product) => product.slug)}},
        select: {id: true, slug: true, categoryId: true},
    });
    for (const product of existingProducts) {
        if (product.categoryId !== category?.id) problems.push(`${product.slug} existe déjà dans une autre catégorie`);
    }

    console.log(`Catégorie ${data.category.slug} : ${category ? "existante" : "à créer"}`);
    attributes.forEach((attribute) => console.log(`${attribute.spec.code} (${attribute.type}) : ${attribute.id ? "existant" : "à créer"}, lié à la catégorie`));
    console.log(`${data.products.length - existingProducts.length} produit(s) à créer, ${existingProducts.length} déjà présent(s)`);

    if (problems.length) {
        problems.forEach((problem) => console.log(`  problème : ${problem}`));
        console.log("Rien n'est écrit.");
        return 1;
    }
    if (!apply || !brand) {
        console.log("Simulation : relancer avec --apply pour écrire.");
        return 0;
    }

    const categoryId = category?.id
        ?? (await db.categories.create({data: {name: data.category.name, slug: data.category.slug, logo: data.category.logo}, select: {id: true}})).id;

    const links = new Map<string, {linkId: string; type: AttributeType}>();
    for (const attribute of attributes) {
        const attributeId = attribute.id
            ?? (await db.attributes.create({data: {code: attribute.spec.code, name: attribute.spec.name ?? attribute.spec.code, type: attribute.type}, select: {id: true}})).id;
        links.set(attribute.spec.code, {linkId: await linkToCategory(categoryId, attributeId), type: attribute.type});
    }

    for (const product of data.products) {
        const existing = existingProducts.find((candidate) => candidate.slug === product.slug);
        const productId = existing?.id ?? (await db.products.create({
            data: {
                name: product.name,
                slug: product.slug,
                sku: product.sku,
                mpn: product.mpn,
                ean13: product.ean13,
                price: product.price,
                images: [],
                shortDescription: product.shortDescription,
                description: product.description,
                categoryId,
                brandId: brand.id,
                stock: {create: {quantity: product.stock, minQuantity: product.minQuantity}},
            },
            select: {id: true},
        })).id;

        for (const [code, raw] of Object.entries(product.attributes)) {
            const link = links.get(code);
            if (!link) continue;
            const row = typedAttributeValue(productId, link.linkId, raw, link.type);
            const fields = {value: row.value, numericValue: row.numericValue ?? null, values: row.values ?? []};
            await db.productAttributeValues.upsert({
                where: {productId_categoryAttributeId: {productId, categoryAttributeId: link.linkId}},
                create: {productId, categoryAttributeId: link.linkId, ...fields},
                update: fields,
            });
        }
        console.log(`${product.slug} : ${existing ? "valeurs réécrites" : "créé avec son stock et ses valeurs"}`);
    }

    return 0;
}

main()
    .then((failures) => {
        process.exitCode = failures;
    })
    .finally(() => db.$disconnect());
