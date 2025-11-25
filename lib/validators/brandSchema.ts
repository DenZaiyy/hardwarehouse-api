import {z} from "zod";

export const brandSchema = z.object({
    name: z.string()
        .trim()
        .min(2, {message: "Le nom doit contenir au moins 2 caractères"})
        .max(100, {message: "Le nom ne peut pas dépasser 100 caractères"}),

    logo: z.string()
        .trim()
        .refine(
            (val) => val === "" || /^https?:\/\//.test(val),
            { message: "Le lien doit commencer par http:// ou https://" }
        )
        .refine(
            (val) => val === "" || !/\s/.test(val),
            { message: "L’URL ne doit pas contenir d’espaces" }
        )
        .refine(
            (val) => {
                if (val === "") return true;
                try {
                    new URL(val);
                    return true;
                } catch {
                    return false;
                }
            },
            { message: "URL invalide" }
        )
        .optional()
});

export type Brand = z.infer<typeof brandSchema>;