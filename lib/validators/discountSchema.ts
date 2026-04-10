import {z} from "zod";
import {DiscountType} from "@prisma/client";

const optionalDate = z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val && val !== "" ? new Date(val) : undefined));

const optionalId = z
    .string()
    .nullable()
    .optional()
    .transform((val) => (val === "" ? null : val));

const optionalIdForForm = z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val));

const optionalDateString = z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val === "" ? undefined : val));

// Input schema for forms (keeps dates as strings)
export const discountInputSchema = z.object({
    productId: optionalIdForForm,
    categoryId: optionalIdForForm,

    discountAmount: z
        .number({ error: "Le montant doit être un nombre." })
        .positive("Le montant doit être supérieur à 0."),

    discountType: z.enum(["PERCENTAGE", "FIXED"] as [DiscountType, ...DiscountType[]], {
        error: "Type de remise invalide.",
    }),

    active: z.boolean(),
    startDate: optionalDateString,
    endDate: optionalDateString,
})
    .refine(
        (data) => {
            const hasProduct = !!data.productId;
            const hasCategory = !!data.categoryId;
            return (hasProduct && !hasCategory) || (!hasProduct && hasCategory);
        },
        {
            message: "Il faut renseigner soit un produit, soit une catégorie, mais pas les deux.",
            path: ["productId"],
        }
    )
    .refine(
        (data) => {
            if (data.discountType === DiscountType.PERCENTAGE) {
                return data.discountAmount > 0 && data.discountAmount <= 100;
            }
            return true;
        },
        {
            message: "Une remise en pourcentage doit être comprise entre 1 et 100.",
            path: ["discountAmount"],
        }
    )
    .refine(
        (data) => {
            if (data.startDate && data.endDate) {
                const startDate = new Date(data.startDate);
                const endDate = new Date(data.endDate);
                return endDate > startDate;
            }
            return true;
        },
        {
            message: "La date de fin doit être postérieure à la date de début.",
            path: ["endDate"],
        }
    );

// Output schema for API (transforms dates to Date objects)
export const discountSchema = z.object({
    productId: optionalId,
    categoryId: optionalId,

    discountAmount: z
        .number({ error: "Le montant doit être un nombre." })
        .positive("Le montant doit être supérieur à 0."),

    discountType: z.enum(["PERCENTAGE", "FIXED"] as [DiscountType, ...DiscountType[]], {
        error: "Type de remise invalide.",
    }),

    active: z.boolean(),
    startDate: optionalDate,
    endDate: optionalDate,
})
    .refine(
        (data) => {
            const hasProduct = !!data.productId;
            const hasCategory = !!data.categoryId;
            return (hasProduct && !hasCategory) || (!hasProduct && hasCategory);
        },
        {
            message: "Il faut renseigner soit un produit, soit une catégorie, mais pas les deux.",
            path: ["productId"],
        }
    )
    .refine(
        (data) => {
            if (data.discountType === DiscountType.PERCENTAGE) {
                return data.discountAmount > 0 && data.discountAmount <= 100;
            }
            return true;
        },
        {
            message: "Une remise en pourcentage doit être comprise entre 1 et 100.",
            path: ["discountAmount"],
        }
    )
    .refine(
        (data) => {
            if (data.startDate && data.endDate) {
                return data.endDate > data.startDate;
            }
            return true;
        },
        {
            message: "La date de fin doit être postérieure à la date de début.",
            path: ["endDate"],
        }
    );

// Explicitly define form types to work with React Hook Form
export type DiscountFormInput = {
    productId?: string | null;
    categoryId?: string | null;
    discountAmount: number;
    discountType: DiscountType;
    active: boolean;
    startDate?: string | null;
    endDate?: string | null;
};

export type DiscountFormOutput = {
    productId?: string | null;
    categoryId?: string | null;
    discountAmount: number;
    discountType: DiscountType;
    active: boolean;
    startDate?: string | null;
    endDate?: string | null;
};
export type DiscountInput = z.input<typeof discountSchema>;
export type DiscountOutput = z.output<typeof discountSchema>;