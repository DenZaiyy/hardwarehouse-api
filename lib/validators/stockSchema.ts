import {z} from "zod";
import {objectIdSchema} from "@/lib/validators/common";

export const stockSchema = z.object({
    minQuantity: z.coerce.number<number>().int("La quantité minimale doit être un nombre entier").min(0, "La quantité minimale dois être positive"),
    quantity: z.coerce.number<number>().int("La quantité doit être un nombre entier").min(0, "La quantité ne peux pas être négative"),
    productId: objectIdSchema,
})

export type Stock = z.infer<typeof stockSchema>;

// Le produit d'un stock ne change pas : un productId différent de celui du stock est refusé par la route
export const stockPatchSchema = stockSchema.partial();