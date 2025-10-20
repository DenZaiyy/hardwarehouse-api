"use client"

import {useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Button} from "@/components/ui/button";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import toast from "react-hot-toast";
import React from "react";
import {apiStockService} from "@/services/stockService";
import {ProductsWithCategoryAndBrand} from "@/types/types";
import {Stocks} from "@/app/generated/prisma/client";
import {Input} from "@/components/ui/input";

type StockFormProps = {
    stock?: Stocks
    products: ProductsWithCategoryAndBrand[]
    method: "POST" | "PATCH"
}

const formSchema = z.object({
    quantity: z.coerce.number<number>().min(0, "Le prix doit être un nombre positif"),
    productId: z.string().nonempty(),
})

const StockForm = ({ stock, products, method }: StockFormProps) => {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            quantity: stock?.quantity ?? 0,
            productId: stock?.productId ?? "",
        }
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!stock) {
            const result = await apiStockService.createStock(values)

            if (!result) {
                toast.error("Une erreur est survenue lors de la création du stock.")
                return
            }

            toast.success("Stock créé avec succès.")
            form.reset()
            if(result.redirect) {
                setTimeout(() => {
                    window.location = result.redirect
                }, 3000)
            }
        } else {
            const result = await apiStockService.updateStock(stock.id, values)

            if (!result) {
                toast.error("Une erreur est survenue lors de la mise à jour du stock.")
                return
            }

            toast.success("Stock mis à jour avec succès.")
            form.reset()
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} method={method} className="space-y-8">
                <div className="md:flex md:gap-4">
                    <FormField
                        control={form.control}
                        name="quantity"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel>Quantité</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        step="1"
                                        placeholder="12"
                                        value={field.value ?? ""}
                                        onChange={(e) => field.onChange(e.target.value === "" ? "" : parseFloat(e.target.value))}
                                    />
                                </FormControl>
                                <FormDescription>
                                    La quantité doit être un nombre positif.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="md:flex md:gap-4">
                    <FormField
                        control={form.control}
                        name="productId"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel>Produit</FormLabel>
                                <FormControl>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Sélectionner un produit" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {products && (
                                                products.map((product) => (
                                                    <SelectItem key={product.id} value={product.id}>{product.name}</SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormDescription>
                                    Sélectionnez la marque du produit.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <Button type="submit">Envoyer</Button>
            </form>
        </Form>
    );
}

export default StockForm;