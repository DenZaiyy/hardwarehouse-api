import {z} from "zod";
import {objectIdSchema} from "@/lib/validators/common";

// Sortie de stock d'une commande payée de la boutique : une ligne par produit, quantités positives.
export const stockExitSchema = z.object({
    orderReference: z.string().trim().min(1, "Référence de commande requise").max(100),
    lines: z.array(z.object({
        productId: objectIdSchema,
        quantity: z.number().int("La quantité doit être un nombre entier").positive("La quantité doit être positive"),
    })).min(1, "Au moins une ligne").max(100),
}).refine(
    ({lines}) => new Set(lines.map((line) => line.productId)).size === lines.length,
    {message: "Un produit ne peut apparaître qu'une fois", path: ["lines"]},
);

export type StockExit = z.infer<typeof stockExitSchema>;
