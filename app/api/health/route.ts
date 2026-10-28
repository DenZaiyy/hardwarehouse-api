import {NextResponse} from "next/server";
import {db} from "@/lib/db";
import {handleApiError} from "@/lib/api/handle-api-error";

// Sonde du déploiement (deploy/receive-release.sh) : 200 quand le serveur démarre et joint MongoDB par Prisma.
// Sans limitation de débit, pour qu'aucun quota ne fasse échouer une bascule, et sans donnée dans la réponse.
export async function GET() {
    try {
        await db.categories.findFirst({ select: { id: true } });
        return NextResponse.json({ status: "ok" });
    } catch (error) {
        return handleApiError("HEALTH GET", error);
    }
}
