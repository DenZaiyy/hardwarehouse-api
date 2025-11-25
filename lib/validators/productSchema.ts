import {z} from "zod";

export const productSchema = z.object({
    name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    price: z.coerce.number<number>().min(0, "Le prix doit être un nombre positif"),
    active: z.boolean(),
    image: z.url("L'URL de l'image doit être valide").optional().or(z.literal("")),
    brandId: z.string().nonempty(),
    categoryId: z.string().nonempty(),
})