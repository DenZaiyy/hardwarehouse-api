import {NextResponse} from "next/server";
import {ApiError} from "./errors";

export function handleApiError(prefix: string, error: unknown): NextResponse {
    // Erreur métier connue → on retourne son status/message directement
    if (error instanceof ApiError) {
        return NextResponse.json(
            { error: error.message, code: error.code },
            { status: error.status }
        );
    }

    // Erreur inattendue → 500 générique
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    console.error(`[${prefix}]`, message);

    return NextResponse.json(
        { error: `Erreur interne`, code: "INTERNAL_ERROR" },
        { status: 500 }
    );
}