/**
 * @jest-environment node
 */
// Matrice des droits du point 5 du dossier : chaque méthode de chaque route appelle la garde attendue.
// L'employé gère le catalogue, les stocks, les remises et les images ; l'administrateur a les mêmes droits, plus les
// comptes, les mouvements de stock et les bons de commande. Une route absente de la matrice fait échouer le test.
import {describe, expect, test} from '@jest/globals';
import {readdirSync, readFileSync} from "node:fs";
import {join, relative} from "node:path";

type Guard = "public" | "boutique" | "équipe" | "admin" | "session seule";

const EXPECTED: Record<string, Record<string, Guard>> = {
    "health": {GET: "public"},
    "v1/brands": {GET: "public", POST: "équipe"},
    "v1/brands/[slug]": {GET: "public", PATCH: "équipe", DELETE: "équipe"},
    "v1/brands/[slug]/products": {GET: "public"},
    "v1/categories": {GET: "public", POST: "équipe"},
    "v1/categories/[slug]": {GET: "public", PATCH: "équipe", DELETE: "équipe"},
    "v1/categories/[slug]/attributes": {GET: "équipe"},
    "v1/categories/[slug]/products": {GET: "public"},
    "v1/discounts": {GET: "public", POST: "équipe"},
    "v1/discounts/[id]": {GET: "public", PATCH: "équipe", DELETE: "équipe"},
    "v1/discounts/category/[slug]": {GET: "public"},
    "v1/discounts/product/[slug]": {GET: "public"},
    "v1/products": {GET: "public", POST: "équipe"},
    "v1/products/[slug]": {GET: "public", PATCH: "équipe", DELETE: "équipe"},
    "v1/purchase-orders": {GET: "admin", POST: "admin"},
    "v1/purchase-orders/[id]": {GET: "admin", DELETE: "admin"},
    "v1/stats/product": {GET: "équipe"},
    "v1/stats/product/[id]": {GET: "équipe"},
    "v1/stats/stock": {GET: "équipe"},
    "v1/stock-exits": {POST: "boutique"},
    "v1/stocks": {GET: "équipe", POST: "équipe"},
    "v1/stocks/[id]": {GET: "équipe", PATCH: "équipe", DELETE: "équipe"},
    "v1/transactions": {GET: "admin", POST: "admin"},
    "v1/transactions/[id]": {GET: "admin"},
    "v1/transactions/product/[slug]": {GET: "admin"},
    "v1/upload/brands/[slug]": {POST: "équipe", DELETE: "équipe"},
    "v1/upload/categories/[slug]": {POST: "équipe", DELETE: "équipe"},
    "v1/upload/products/[slug]": {POST: "équipe", DELETE: "équipe"},
    "v1/upload/products/[slug]/[filename]": {DELETE: "équipe"},
    "v1/users": {GET: "admin", POST: "admin"},
    "v1/users/[id]": {GET: "admin", PATCH: "admin", DELETE: "admin"},
    "v1/users/[id]/orders": {GET: "admin"},
    "v1/users/[id]/transactions": {GET: "admin"},
};

const API_DIR = join(__dirname, "../../../app/api");

function routeFiles(dir: string): string[] {
    return readdirSync(dir, {withFileTypes: true}).flatMap((entry) => {
        const path = join(dir, entry.name);
        if (entry.isDirectory()) return routeFiles(path);
        return entry.name === "route.ts" ? [path] : [];
    });
}

// Garde appelée par chaque méthode exportée : un simple auth() ou requireAuth() ne vérifie que la session
function guardsOf(source: string): Record<string, Guard> {
    const parts = source.split(/export async function (GET|POST|PUT|PATCH|DELETE)\b/);
    const guards: Record<string, Guard> = {};
    for (let i = 1; i < parts.length; i += 2) {
        const body = parts[i + 1].split(/\nexport /)[0];
        guards[parts[i]] = /requireAdmin\(/.test(body) ? "admin"
            : /requireStaff\(/.test(body) ? "équipe"
            : /requireShop\(/.test(body) ? "boutique"
            : /requireAuth\(|await auth\(\)/.test(body) ? "session seule"
            : "public";
    }
    return guards;
}

describe("matrice des droits de l'API", () => {
    test("chaque route applique la garde prévue pour chacune de ses méthodes", () => {
        const actual = Object.fromEntries(routeFiles(API_DIR).map((file) => [
            relative(API_DIR, file).replace(/\/route\.ts$/, ""),
            guardsOf(readFileSync(file, "utf8")),
        ]));

        expect(actual).toEqual(EXPECTED);
    });
});
