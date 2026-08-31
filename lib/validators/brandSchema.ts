import {z} from "zod";

export const brandSchema = z.object({
    name: z.string()
        .trim()
        .min(2, {message: "Le nom doit contenir au moins 2 caractères"})
        .max(100, {message: "Le nom ne peut pas dépasser 100 caractères"}),
    active: z.boolean(),
});

export type Brand = z.infer<typeof brandSchema>;

// logo est une URL déjà uploadée (endpoint dédié), absente du schéma de base.
export const brandPatchSchema = brandSchema
    .extend({ logo: z.string().optional() })
    .partial();