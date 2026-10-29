// Appels du back-office à ses propres routes de liste (produits, marques, remises) : avec le secret, la route renvoie
// tout, sans pagination. Le secret ne sort pas de l'API : la boutique ne l'envoie pas et reste paginée comme tout client.
const HEADER = "x-internal-request";

// Côté services : sans secret, la route paginerait en silence à 25 éléments, d'où une erreur explicite
export function internalRequestHeaders(): Record<string, string> {
    const secret = process.env.INTERNAL_API_SECRET;
    if (!secret) {
        throw new Error(
            "INTERNAL_API_SECRET manquant : les listes du back-office seraient tronquées à 25 éléments " +
            "(deploy/README.md, étape 3)",
        );
    }

    return {[HEADER]: secret};
}

// Côté routes : un secret absent ou vide ne doit jamais faire passer un appel pour interne
export function isInternalRequest(request: Request): boolean {
    const secret = process.env.INTERNAL_API_SECRET;
    return Boolean(secret) && request.headers.get(HEADER) === secret;
}
