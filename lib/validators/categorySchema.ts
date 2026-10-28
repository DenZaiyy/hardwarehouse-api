import {z} from "zod";

export const categorySchema = z.object({
    name: z.string()
        .trim()
        .min(2, {error: "Le nom doit contenir au moins 2 caractères"})
        .max(100, {error: "Le nom ne peut pas dépasser 100 caractères"}),
    active: z.boolean(),
});

export type Category = z.infer<typeof categorySchema>;

// logo est une URL déjà uploadée (endpoint dédié), absente du schéma de base.
export const categoryPatchSchema = categorySchema
    .extend({ logo: z.string().optional() })
    .partial();