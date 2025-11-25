import {z} from "zod";

export const categorySchema = z.object({
    name: z.string().min(2, {error: "Le nom doit contenir au moins 2 caractères"}),
    logo: z.url({error: "L'URL du logo doit être valide"}).optional().or(z.literal("")),
})