import {z} from "zod";

export const stockSchema = z.object({
    minQuantity: z.coerce.number<number>().min(0, "La quantité minimale dois être positive"),
    quantity: z.coerce.number<number>().min(0, "La quantité ne peux pas être négative"),
    productId: z.string().nonempty(),
})