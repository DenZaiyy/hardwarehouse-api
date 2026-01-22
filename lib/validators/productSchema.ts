import {z} from "zod";

export const productSchema = z.object({
    name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    price: z.coerce.number<number>().min(0, "Le prix doit être un nombre positif"),
    description: z.string().optional(),
    shortDescription: z.string().max(255, "La description courte ne doit pas dépasser 255 caractères").optional(),
    thumbnail: z.url("L'URL de l'image doit être valide").optional().or(z.literal("")),
    images: z.array(z.url("L'URL de l'image doit être valide")).optional(),
    attributes: z.record(z.string(), z.string()).optional(), // Record of attributeId -> value
    active: z.boolean(),
    brandId: z.string().nonempty(),
    categoryId: z.string().nonempty(),
})