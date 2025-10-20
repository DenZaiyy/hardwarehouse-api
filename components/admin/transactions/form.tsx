"use client"

import {useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Button} from "@/components/ui/button";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import toast from "react-hot-toast";
import React, {useEffect} from "react";
import {StocksWithProduct} from "@/types/types";
import {Switch} from "@/components/ui/switch";
import {apiTransactionService} from "@/services/transactionService";
import {Input} from "@/components/ui/input";

type TransactionFormProps = {
    stocks: StocksWithProduct[]
    method: "POST"
}

const formSchema = z.object({
    type: z.boolean(),
    oldQtt: z.coerce.number<number>().min(0, "La quantité doit être positive"),
    newQtt: z.coerce.number<number>().min(0, "La quantité doit être positive"),
    productId: z.string().nonempty(),
})

const TransactionForm = ({ stocks, method }: TransactionFormProps) => {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            type: true,
            oldQtt: undefined,
            newQtt: undefined,
            productId: undefined,
        }
    })

    const selectedProductId = form.watch("productId")
    const selectedTypeTransaction = form.watch('type')

    useEffect(() => {
        if (!selectedProductId) return

        const stock = stocks.find((s) => s.product.id === selectedProductId)
        if (stock) {
            form.setValue('oldQtt', stock.quantity)
        }
    }, [selectedProductId, stocks, form])

    async function onSubmit(values: z.infer<typeof formSchema>) {
        const finalQuantity = values.type
            ? values.oldQtt + values.newQtt
            : values.oldQtt - values.newQtt

        if (finalQuantity < 0) {
            toast.error("La quantité finale ne peut pas être négative.")
            return
        }

        const payload = { ...values, finalQuantity }
        const result = await apiTransactionService.createTransaction(payload)

        if (!result) {
            toast.error("Une erreur est survenue lors de la création de la transaction.")
            return
        }

        toast.success("Transaction créé avec succès.")
        form.reset()
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} method={method} className="space-y-8">
                <div className="md:flex md:gap-4">
                    <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel>Transaction positive</FormLabel>
                                <FormControl>
                                    <Switch
                                        defaultChecked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <FormDescription>
                                    Définir si la transaction doit être un ajout ou un retrait de quantité (false = retrait, true = ajout)
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
                        name="oldQtt"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel>Quantité actuelle</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        step="1"
                                        value={field.value ?? ""}
                                        disabled={true}
                                        onChange={(e) => field.onChange(e.currentTarget.value)}
                                    />
                                </FormControl>
                                <FormDescription>
                                    Aperçu de la quantité actuellement en stock (non modifiable)
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div>
                    <FormField
                        control={form.control}
                        name="newQtt"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel>{selectedTypeTransaction ? "Quantité à ajouter" : "Quantité à retirer"}</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        step="1"
                                        value={field.value ?? ""}
                                        onChange={(e) => field.onChange(e.currentTarget.value)}
                                    />
                                </FormControl>
                                <FormDescription>
                                    {selectedTypeTransaction ? (
                                        "Définir la quantité à ajouter sur le stock actuelle du produit sélectionner"
                                    ): (
                                        "Définir la quantité à retirer du stock actuelle par rapport au produit sélectionner"
                                    )}
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

export default TransactionForm;