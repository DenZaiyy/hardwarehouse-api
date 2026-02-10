import {z} from "zod";

export const categorySchema = z.object({
    name: z.string()
        .trim()
        .min(2, {message: "Le nom doit contenir au moins 2 caractères"})
        .max(100, {message: "Le nom ne peut pas dépasser 100 caractères"}),
    active: z.boolean(),
});

export type Category = z.infer<typeof categorySchema>;