import {z} from "zod";

export const purchaseOrderSchema = z.object({
    quantity: z.coerce.number<number>().positive({error: "La quantité doit être positive"}),
    productId: z.string().nonempty(),
})