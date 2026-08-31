import {z} from "zod";
import {objectIdSchema} from "@/lib/validators/common";

export const purchaseOrderSchema = z.object({
    quantity: z.coerce.number<number>().int("La quantité doit être un nombre entier").positive({error: "La quantité doit être positive"}),
    productId: objectIdSchema,
})

export type PurchaseOrder = z.infer<typeof purchaseOrderSchema>;