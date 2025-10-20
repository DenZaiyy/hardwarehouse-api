"use client"

import {useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Button} from "@/components/ui/button";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import toast from "react-hot-toast";
import React from "react";
import {StocksWithProduct} from "@/types/types";
import {Input} from "@/components/ui/input";
import {apiPurchaseOrdersService} from "@/services/purchaseOrderService";

type PurchaseOrderFormProps = {
    stocks: StocksWithProduct[]
    method: "POST"
}

const formSchema = z.object({
    quantity: z.coerce.number<number>().min(0, "La quantité doit être positive"),
    productId: z.string().nonempty(),
})

const PurchaseOrderForm = ({ stocks, method }: PurchaseOrderFormProps) => {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            quantity: undefined,
            productId: undefined,
        }
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!values.quantity) return

        if (values.quantity < 0) {
            toast.error("La quantité ne peut pas être négative.")
            return
        }

        const result = await apiPurchaseOrdersService.createPurchase(values)

        if (!result) {
            toast.error("Une erreur est survenue lors de la création du bon de commande.")
            return
        }

        toast.success("Bon de commande créé avec succès.")
        form.reset()
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} method={method} className="space-y-8">
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
                                            {stocks && (
                                                stocks.map((stock) => (
                                                    <SelectItem key={stock.product.id} value={stock.product.id}>{stock.product.name} ({stock.quantity})</SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormDescription>
                                    Sélectionnez le produit.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="quantity"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel>Quantité à commander</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        step="1"
                                        value={field.value ?? ""}
                                        onChange={(e) => field.onChange(e.currentTarget.value)}
                                    />
                                </FormControl>
                                <FormDescription>
                                    Définir la quantité à commander
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

export default PurchaseOrderForm;