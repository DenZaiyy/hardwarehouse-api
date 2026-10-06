import {createHash, timingSafeEqual} from "node:crypto";
import {NextRequest, NextResponse} from "next/server";

/**
 * Accès de serveur à serveur réservé à la boutique Symfony, pour ses sorties de stock : jeton partagé
 * SHOP_API_TOKEN, envoyé en `Authorization: Bearer`. Sans jeton configuré côté API, tout est refusé.
 */
export function requireShop(req: NextRequest): NextResponse | null {
    const expected = process.env.SHOP_API_TOKEN ?? "";
    const header = req.headers.get("authorization") ?? "";
    const provided = header.startsWith("Bearer ") ? header.slice("Bearer ".length) : "";

    if (expected === "" || !tokensMatch(provided, expected)) {
        return NextResponse.json({ error: "Unauthorized", statusCode: 401 }, { status: 401 });
    }

    return null;
}

/**
 * Comparaison en temps constant d'empreintes de même longueur : la réponse ne révèle ni le contenu
 * ni la longueur du jeton attendu.
 */
export function tokensMatch(provided: string, expected: string): boolean {
    const digest = (value: string) => createHash("sha256").update(value).digest();

    return timingSafeEqual(digest(provided), digest(expected));
}
