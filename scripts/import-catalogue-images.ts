// Images officielles des produits du catalogue, d'après scripts/catalogue-images.json (sources validées par Kevin).
// Chaque image est téléchargée, centrée sur un carré de la couleur de son fond (centerOnSquare), puis confiée à
// ImageUploadService comme un envoi depuis le back-office : mêmes fichiers WebP, mêmes chemins en base. La première
// image devient la miniature, les suivantes la galerie. Le MPN et l'EAN du manifeste sont écrits avec.
//
// Simulation par défaut (téléchargement et préparation, rien n'est écrit), --apply pour écrire les fichiers et la base.
// --db-only n'écrit que la base, sans rien télécharger : en production, les fichiers générés en local sont copiés sur le
// VPS (shared/images/products), puis ce mode y reporte les chemins. Des slugs en argument limitent l'import à ces produits.
// Usage (depuis la racine du projet, ImageUploadService écrit dans public/images) :
//   node --env-file=.env --env-file=.env.local --import tsx scripts/import-catalogue-images.ts [--apply] [--db-only] [slug…]
import {readFileSync} from "node:fs";
import sharp from "sharp";
import {db} from "@/lib/db";
import {ImageUploadService} from "@/services/image-upload.service";

interface ManifestEntry {
    slug: string;
    sourceUrl: string | null;
    images: string[];
    mpn: string | null;
    ean13: string | null;
}

const USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36";
// Marge autour du produit, en part du côté du carré
const MARGIN = 0.06;
// Écart toléré avec la couleur du fond pour le rognage : 30 retire aussi les fonds de studio gris clair en dégradé
const TRIM_THRESHOLD = 30;
// Côté maximal de l'image confiée au service, qui refuse les fichiers de plus de 5 Mo
const MAX_SIDE = 2000;

const apply = process.argv.includes("--apply");
const dbOnly = process.argv.includes("--db-only");
const slugs = process.argv.slice(2).filter((arg) => !arg.startsWith("--"));
const manifest = JSON.parse(readFileSync("scripts/catalogue-images.json", "utf8")) as ManifestEntry[];
const entries = slugs.length ? manifest.filter((entry) => slugs.includes(entry.slug)) : manifest;

function isValidEan13(code: string): boolean {
    if (!/^\d{13}$/.test(code)) return false;
    const digits = [...code].map(Number);
    const sum = digits.slice(0, 12).reduce((total, digit, index) => total + digit * (index % 2 ? 3 : 1), 0);
    return (10 - (sum % 10)) % 10 === digits[12];
}

async function download(url: string): Promise<Buffer> {
    const response = await fetch(url, {headers: {"user-agent": USER_AGENT, accept: "image/webp,image/png,image/jpeg,image/*"}, signal: AbortSignal.timeout(30_000)});
    const type = response.headers.get("content-type") ?? "";
    if (!response.ok || !type.startsWith("image/")) {
        throw new Error(`${url} : HTTP ${response.status}, ${type || "type inconnu"}`);
    }
    return Buffer.from(await response.arrayBuffer());
}

// La miniature de l'API est recadrée en carré (fit cover) et la galerie de la boutique montre des vignettes carrées :
// sans ce carré, un clavier ou une carte graphique perdrait ses extrémités. Les marges d'origine sont rognées pour que
// tous les produits occupent le cadre de la même façon, quelle que soit la marque. Le carré est complété avec la couleur
// du fond de l'image (le pixel en haut à gauche, la référence de trim) : blanc pour la plupart, gris clair pour les photos
// de studio, sans cadre visible autour du produit.
// Passes séparées, car sharp exécute extend après resize au sein d'un même pipeline : le carré serait d'abord recadré,
// puis élargi. Les étapes intermédiaires restent en pixels bruts pour ne pas recompresser l'image d'origine.
async function centerOnSquare(source: Buffer): Promise<File> {
    const flat = await sharp(source).flatten({background: "#ffffff"}).raw().toBuffer({resolveWithObject: true});
    const [r, g, b] = flat.data;
    const trimmed = await sharp(flat.data, {raw: flat.info}).trim({threshold: TRIM_THRESHOLD}).raw().toBuffer({resolveWithObject: true});
    const side = Math.round(Math.max(trimmed.info.width, trimmed.info.height) * (1 + 2 * MARGIN));
    const horizontal = side - trimmed.info.width;
    const vertical = side - trimmed.info.height;
    const square = await sharp(trimmed.data, {raw: trimmed.info})
        .extend({top: Math.floor(vertical / 2), bottom: Math.ceil(vertical / 2), left: Math.floor(horizontal / 2), right: Math.ceil(horizontal / 2), background: {r, g, b}})
        .raw()
        .toBuffer({resolveWithObject: true});
    const output = await sharp(square.data, {raw: square.info})
        .resize(Math.min(side, MAX_SIDE), Math.min(side, MAX_SIDE))
        .jpeg({quality: 92})
        .toBuffer();
    return new File([new Uint8Array(output)], "image.jpg", {type: "image/jpeg"});
}

async function uploadImages(entry: ManifestEntry): Promise<{thumbnail: string; images: string[]}> {
    const [thumbnail, ...gallery] = await Promise.all(entry.images.map(async (url) => centerOnSquare(await download(url))));
    if (!apply) {
        return {thumbnail: `(simulation) ${thumbnail.size} octets`, images: gallery.map((file) => `(simulation) ${file.size} octets`)};
    }

    // Comme la route d'envoi du back-office : les anciennes images du produit sont remplacées, pas complétées
    await ImageUploadService.deleteGalleryImages("products", entry.slug);
    await ImageUploadService.deleteThumbnail("products", entry.slug);
    const result = await ImageUploadService.uploadProductImages(entry.slug, {
        thumbnail,
        ...(gallery.length && {images: new Map(gallery.map((file, index) => [index, file]))}),
    });
    if (!result.success || !result.thumbnail) {
        throw new Error(result.success ? "miniature non générée" : result.error);
    }
    return {thumbnail: result.thumbnail, images: result.images ?? []};
}

// Chemins que produit ImageUploadService.getImageUrl() pour les fichiers déjà générés
function generatedPaths(entry: ManifestEntry): {thumbnail: string; images: string[]} {
    return {
        thumbnail: ImageUploadService.getImageUrl("products", entry.slug, "thumbnail.webp"),
        images: entry.images.slice(1).map((_, index) => ImageUploadService.getImageUrl("products", entry.slug, `image-${index + 1}.webp`)),
    };
}

async function main(): Promise<number> {
    let failures = 0;
    for (const entry of entries) {
        try {
            if (!entry.images.length) throw new Error("aucune image dans le manifeste");
            if (entry.ean13 && !isValidEan13(entry.ean13)) throw new Error(`EAN ${entry.ean13} invalide`);

            const paths = dbOnly ? generatedPaths(entry) : await uploadImages(entry);
            // La galerie est toujours réécrite : un produit à une seule image ne doit pas garder les anciennes
            const data = {...paths, ...(entry.mpn && {mpn: entry.mpn}), ...(entry.ean13 && {ean13: entry.ean13})};
            if (apply) {
                await db.products.update({where: {slug: entry.slug}, data});
            }
            console.log(`ok ${entry.slug} : miniature + ${paths.images.length} image(s)${entry.mpn ? `, MPN ${entry.mpn}` : ""}${entry.ean13 ? `, EAN ${entry.ean13}` : ""}`);
        } catch (error) {
            failures++;
            console.log(`ÉCHEC ${entry.slug} : ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    console.log(`${entries.length - failures}/${entries.length} produit(s)${apply ? " écrits" : " prêts (simulation : relancer avec --apply pour écrire)"}`);
    return failures;
}

main()
    .then((failures) => {
        process.exitCode = failures ? 1 : 0;
    })
    .finally(() => db.$disconnect());
