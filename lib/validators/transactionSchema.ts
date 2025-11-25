import {z} from "zod";

export const transactionSchema = z.object({
    type: z.boolean(),
    oldQtt: z.coerce.number<number>().min(0, "La quantité doit être positive"),
    newQtt: z.coerce.number<number>().min(0, "La quantité doit être positive"),
    productId: z.string().nonempty(),
})