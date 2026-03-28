"use client"

import {useForm} from "react-hook-form";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Button} from "@/components/ui/button";
import {Switch} from "@/components/ui/switch";
import {Input} from "@/components/ui/input";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Categories, Discounts, DiscountType} from "@prisma/client";
import toast from "react-hot-toast";
import React from "react";
import {DiscountFormInput, DiscountFormOutput, discountInputSchema} from "@/lib/validators/discountSchema";
import {createDiscount, updateDiscount} from "@/services/discount.service";
import {PaginatedResponse, ProductsWithCategoryAndBrand} from "@/types/types";
import {zodResolver} from "@hookform/resolvers/zod";

type DiscountFormProps = {
    discount?: Discounts;
    method: "POST" | "PATCH";
    products?: PaginatedResponse<ProductsWithCategoryAndBrand>
    categories?: PaginatedResponse<Categories>;
}

const DiscountForm = ({ discount, method, products, categories }: DiscountFormProps) => {
    const form = useForm<DiscountFormInput>({
        resolver: zodResolver(discountInputSchema),
        defaultValues: {
            productId: discount?.productId ?? null,
            categoryId: discount?.categoryId ?? null,
            discountAmount: discount?.discountAmount ?? undefined,
            discountType: discount?.discountType ?? DiscountType.PERCENTAGE,
            active: discount?.active ?? true,
            startDate: discount?.startDate
                ? discount.startDate.toISOString().slice(0, 16)
                : "",
            endDate: discount?.endDate
                ? discount.endDate.toISOString().slice(0, 16)
                : "",
        },
    });

    const discountType = form.watch("discountType");
    const selectedProductId = form.watch("productId");
    const selectedCategoryId = form.watch("categoryId");

    const isProductLocked = !!selectedCategoryId;
    const isCategoryLocked = !!selectedProductId;

    async function onSubmit(values: DiscountFormOutput) {
        try {
            if (method === "POST") {
                // Transform form data to API format
                const apiData = {
                    ...values,
                    startDate: values.startDate ? new Date(values.startDate) : undefined,
                    endDate: values.endDate ? new Date(values.endDate) : undefined,
                };
                const result = await createDiscount(apiData);
                if (!result) {
                    toast.error("Une erreur est survenue lors de la création de la remise.");
                    return;
                }
                toast.success("Remise créée avec succès.");
                form.reset();
            } else {
                const result = await updateDiscount(discount!.id, { active: values.active });
                if (!result) {
                    toast.error("Une erreur est survenue lors de la mise à jour de la remise.");
                    return;
                }
                toast.success("Remise mise à jour avec succès.");
            }
        } catch (error) {
            console.error("[DiscountForm]", error);
            toast.error("Une erreur est survenue.");
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

                <div className="flex gap-4 w-full">
                    {/* Produit */}
                    <FormField
                        control={form.control}
                        name="productId"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel>Produit</FormLabel>
                                <Select
                                    onValueChange={(val) => {
                                        field.onChange(val);
                                        // Réinitialiser la catégorie si un produit est choisi
                                        form.setValue("categoryId", null);
                                    }}
                                    value={field.value ?? ""}
                                    disabled={method === "PATCH" || isProductLocked}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Sélectionner un produit" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {products?.data?.map((product) => (
                                            <SelectItem key={product.id} value={product.id}>
                                                {product.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormDescription>
                                    Seul le produit sélectionné sera en remise.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Catégorie */}
                    <FormField
                        control={form.control}
                        name="categoryId"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel>Catégorie</FormLabel>
                                <Select
                                    onValueChange={(val) => {
                                        field.onChange(val);
                                        // Réinitialiser le produit si une catégorie est choisie
                                        form.setValue("productId", null);
                                    }}
                                    value={field.value ?? ""}
                                    disabled={method === "PATCH" || isCategoryLocked}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Sélectionner une catégorie" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories?.data?.map((category) => (
                                            <SelectItem key={category.id} value={category.id}>
                                                {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FormDescription>
                                    Tous les produits de la catégorie seront en remise.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex gap-4 w-full">
                    {/* Type de remise */}
                    <FormField
                        control={form.control}
                        name="discountType"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel>Type de remise</FormLabel>
                                <Select
                                    onValueChange={field.onChange}
                                    defaultValue={field.value}
                                    disabled={method === "PATCH"}
                                >
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Sélectionner un type" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        <SelectItem value={DiscountType.PERCENTAGE}>Pourcentage (%)</SelectItem>
                                        <SelectItem value={DiscountType.FIXED}>Montant fixe (€)</SelectItem>
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Montant */}
                    <FormField
                        control={form.control}
                        name="discountAmount"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel>Montant</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        min={0}
                                        max={discountType === DiscountType.PERCENTAGE ? 100 : undefined}
                                        step={discountType === DiscountType.PERCENTAGE ? 1 : 0.01}
                                        placeholder={discountType === DiscountType.PERCENTAGE ? "Ex: 20" : "Ex: 15.00"}
                                        name={field.name}
                                        ref={field.ref}
                                        onBlur={field.onBlur}
                                        value={Number.isNaN(field.value) || field.value === undefined ? "" : field.value}
                                        onChange={(e) => {
                                            const parsed = parseFloat(e.target.value);
                                            field.onChange(Number.isNaN(parsed) ? undefined : parsed);
                                        }}
                                        disabled={method === "PATCH"}
                                    />
                                </FormControl>
                                <FormDescription>
                                    {discountType === DiscountType.PERCENTAGE
                                        ? "Valeur entre 1 et 100."
                                        : "Montant en euros."}
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="flex gap-4 w-full">
                    {/* Date de début */}
                    <FormField
                        control={form.control}
                        name="startDate"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel>Date de début</FormLabel>
                                <FormControl>
                                    <Input
                                        type="datetime-local"
                                        value={field.value || ""}
                                        onChange={(e) => field.onChange(e.target.value || undefined)}
                                        onBlur={field.onBlur}
                                        name={field.name}
                                        ref={field.ref}
                                        disabled={method === "PATCH"}
                                    />
                                </FormControl>
                                <FormDescription>
                                    Date à partir de quand la remise sera active
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    {/* Date de fin */}
                    <FormField
                        control={form.control}
                        name="endDate"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel>Date de fin</FormLabel>
                                <FormControl>
                                    <Input
                                        type="datetime-local"
                                        value={field.value || ""}
                                        onChange={(e) => field.onChange(e.target.value || undefined)}
                                        onBlur={field.onBlur}
                                        name={field.name}
                                        ref={field.ref}
                                        disabled={method === "PATCH"}
                                    />
                                </FormControl>
                                <FormDescription>
                                    Laisser vide pour une remise sans expiration.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                {/* Actif */}
                <FormField
                    control={form.control}
                    name="active"
                    render={({ field }) => (
                        <FormItem className="w-1/4">
                            <FormLabel>Remise active</FormLabel>
                            <FormControl>
                                <Switch
                                    defaultChecked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            <FormDescription>
                                Définir si la remise est active ou non.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit">
                    {method === "POST" ? "Créer la remise" : "Mettre à jour"}
                </Button>
            </form>
        </Form>
    );
};

export default DiscountForm;