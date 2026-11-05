import {NextResponse} from "next/server";
import {Prisma} from "@prisma/client";
import {ZodError} from "zod";
import {ApiError} from "./errors";

export function handleApiError(prefix: string, error: unknown): NextResponse {
    // Deux transactions MongoDB ont écrit le même document : Prisma a annulé celle-ci, rien n'a été écrit
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2034") {
        return NextResponse.json(
            { error: "Une autre modification était en cours : rechargez la page, puis recommencez.", code: "CONFLICT" },
            { status: 409 }
        );
    }

    if (error instanceof ZodError) {
        return NextResponse.json(
            {
                error: "Requête invalide",
                code: "VALIDATION_ERROR",
                issues: error.issues.map((issue) => ({
                    path: issue.path.join("."),
                    message: issue.message,
                })),
            },
            { status: 400 }
        );
    }

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