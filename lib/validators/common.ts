import {z} from "zod";

// Évite qu'un id malformé remonte jusqu'à Prisma (erreur 500) au lieu d'un 400 Zod.
export const objectIdSchema = z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Identifiant invalide");
