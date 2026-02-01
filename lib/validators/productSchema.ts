import {z} from "zod";

export const productSchema = z.object({
    name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    price: z.coerce.number<number>().min(0, "Le prix doit être un nombre positif"),
    description: z.string().optional(),
    shortDescription: z.string().max(255, "La description courte ne doit pas dépasser 255 caractères").optional(),
    thumbnail: z.union([
        z.instanceof(File, {message: "Le fichier de la miniature doit être un fichier valide"})
            .refine(file => !file || file.size !== 0 || file.size <= 5000000, {message: 'La taille maximum a été dépassé'} ),
        z.string().optional(),
    ])
        .refine(value => value instanceof File || typeof value === 'string', {
        message: "La miniature doit être un fichier ou une URL valide"
        }).optional(),
    images: z.union([
        z.array(z.instanceof(File)),
        z.array(z.string().url("L'URL de l'image doit être valide"))
    ]).optional(),
    attributes: z.record(z.string(), z.string()).optional(),
    active: z.boolean(),
    brandId: z.string().min(1, "La marque est requise"),
    categoryId: z.string().min(1, "La catégorie est requise"),
})