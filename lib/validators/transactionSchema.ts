import {z} from "zod";
import {objectIdSchema} from "@/lib/validators/common";

export const transactionSchema = z.object({
    type: z.boolean(),
    oldQtt: z.coerce.number<number>().int("La quantité doit être un nombre entier").min(0, "La quantité doit être positive"),
    newQtt: z.coerce.number<number>().int("La quantité doit être un nombre entier").min(0, "La quantité doit être positive"),
    productId: objectIdSchema,
})

export type Transaction = z.infer<typeof transactionSchema>;

// Le client envoie en plus finalQuantity, déjà calculé côté form (oldQtt +/- newQtt selon `type`).
export const transactionCreateSchema = transactionSchema.extend({
    finalQuantity: z.coerce.number<number>().int("La quantité doit être un nombre entier").min(0, "La quantité doit être positive"),
});