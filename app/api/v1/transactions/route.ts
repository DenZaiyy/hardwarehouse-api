import {NextRequest, NextResponse} from "next/server";
import {db} from "@/lib/db";
import {currentUser} from "@clerk/nextjs/server";
import {clientIp, rateLimiter} from "@/lib/rate-limit";
import {requireAdmin} from "@/lib/auth/require-role";
import {handleApiError} from "@/lib/api/handle-api-error";
import {NotFoundError} from "@/lib/api/errors";
import {applyManualMovement} from "@/lib/stocks/stock-movements";
import {transactionCreateSchema} from "@/lib/validators/transactionSchema";

export async function GET(req: NextRequest) {
    const { response } = await requireAdmin();
    if (response) return response;

    let remaining = 0;
    let reset = 0;

    const ip = clientIp(req);


    try {
        const result = await rateLimiter.limit(ip);
        remaining = result.remaining ? result.remaining : 0;
        reset = result.reset ? result.reset : 0;

        if (!result.success) {
            return NextResponse.json(
                { error: "Trop de demandes" },
                { status: 429 }
            );
        }
    } catch (err) {
        console.warn('Rate limiter unavailable', err);
    }


    try {
        const transactions = await db.transactions.findMany({
            select: {
                id: true,
                type: true,
                oldQtt: true,
                newQtt: true,
                userId: true,
                userFullName: true,
                createdAt: true,
                product: {
                    select: {
                        id: true,
                        name: true,
                        active: true,
                        slug: true,
                        price: true,
                        thumbnail: true
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        const res = NextResponse.json(transactions, { status: 200 });
        res.headers.set('X-RateLimit-Remaining', remaining.toString());
        res.headers.set('X-RateLimit-Reset', reset.toString());

        return res;
    } catch (error) {
        return handleApiError("TRANSACTIONS GET", error);
    }
}

export async function POST(req: NextRequest) {
    // Un mouvement de stock alimente un historique réservé aux administrateurs
    // (GET de cette route, /transactions/[id], et la page /admin/transactions
    // filtrée par proxy.ts). L'écriture exige donc le même rôle que la lecture,
    // sans quoi l'API contournerait le contrôle appliqué par l'interface.
    const { userId, response } = await requireAdmin();
    if (response) return response;

    try {
        // Le formulaire envoie la quantité affichée à son ouverture (oldQtt), la quantité déplacée (newQtt) et la
        // quantité finale qu'il a calculée (finalQuantity), qui n'est plus reprise : le serveur repart du stock qu'il
        // lit, et refuse le mouvement si ce stock a bougé depuis l'ouverture du formulaire (lib/stocks)
        const { type, oldQtt, newQtt, productId } = transactionCreateSchema.parse(await req.json());
        const user = await currentUser()
        const author = { userId, userFullName: user?.fullName ?? "Undefined User" };

        const existingProduct = await db.products.findUnique({
            where: {
                id: productId
            },
            select: { id: true }
        })

        if (!existingProduct) throw new NotFoundError("Produit");

        const transaction = await db.$transaction((tx) => applyManualMovement(tx, {
            productId,
            type,
            expectedQuantity: oldQtt,
            movedQuantity: newQtt,
        }, author));

        return NextResponse.json(transaction, { status: 200 })

    } catch (error) {
        return handleApiError("TRANSACTION POST", error);
    }
}