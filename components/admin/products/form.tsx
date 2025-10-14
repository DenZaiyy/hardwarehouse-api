"use client"

import {useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {ProductsWithCategoryAndBrand} from "@/types/types";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupButton,
    InputGroupInput,
    InputGroupText
} from "@/components/ui/input-group";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Brands, Categories} from "@/app/generated/prisma/client";
import {apiProductService} from "@/services/productService";
import toast from "react-hot-toast";
import React from "react";
import {Label} from "@/components/ui/label";
import Image from "next/image";

type ProductFormProps = {
    product?: ProductsWithCategoryAndBrand
    brands: Brands[]
    categories: Categories[]
    method: "POST" | "PATCH"
}

const formSchema = z.object({
    name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    price: z.coerce.number<number>().min(0, "Le prix doit être un nombre positif"),
    image: z.string().url("L'URL de l'image doit être valide").optional().or(z.literal("")),
    brandId: z.string().nonempty(),
    categoryId: z.string().nonempty(),
})

const ProductForm = ({ product, brands, categories, method }: ProductFormProps) => {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: product?.name ?? "",
            price: product?.price ?? 0,
            image: product?.image ?? "",
            brandId: product?.brand.id ?? "",
            categoryId: product?.category.id ?? "",
        }
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!product) {
            console.table(values);
            const result = await apiProductService.createProduct(values)

            console.table(result)

            if (!result) {
                toast.error("Une erreur est survenue lors de la création du produit.")
                return
            }

            toast.success("Produit créé avec succès.")
            if(result.redirect) {
                form.reset()
                setTimeout(() => {
                    window.location = result.redirect
                }, 3000)
            }

        } else {
            const result = await apiProductService.updateProduct(product.id, values)

            if (!result) {
                toast.error("Une erreur est survenue lors de la mise à jour du produit.")
                return
            }

            toast.success("Produit mis à jour avec succès.")
            form.reset()
        }
    }

    const [previewImageUrl, setPreviewImageUrl] = React.useState<string | null>(null)

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} method={method} className="space-y-8">
                <div className="md:flex md:gap-4">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel>Nom du produit</FormLabel>
                                <FormControl>
                                    <Input placeholder="Nom du produit" type="text" {...field} />
                                </FormControl>
                                <FormDescription>
                                    Le nom du produit doit contenir au moins 2 caractères.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="price"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel>Prix</FormLabel>
                                <FormControl>
                                    <InputGroup>
                                        <InputGroupAddon>
                                            <InputGroupText>EUR</InputGroupText>
                                        </InputGroupAddon>
                                        <InputGroupInput
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            value={field.value ?? ""}
                                            onChange={(e) => field.onChange(e.target.value === "" ? "" : parseFloat(e.target.value))}
                                        />
                                        <InputGroupAddon align="inline-end">
                                            <InputGroupText>€</InputGroupText>
                                        </InputGroupAddon>
                                    </InputGroup>
                                </FormControl>
                                <FormDescription>
                                    Le prix doit être un nombre positif.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="md:flex md:gap-4">
                    <FormField
                        control={form.control}
                        name="brandId"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel>Marque</FormLabel>
                                <FormControl>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Sélectionner une marque" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {brands && (
                                                brands.map((brand) => (
                                                    <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
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
                    <FormField
                        control={form.control}
                        name="categoryId"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel>Catégorie</FormLabel>
                                <FormControl>
                                    <Select
                                        onValueChange={field.onChange}
                                        value={field.value}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Sélectionner une catégorie" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories && (
                                                categories.map((category) => (
                                                    <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                                                ))
                                            )}
                                        </SelectContent>
                                    </Select>
                                </FormControl>
                                <FormDescription>
                                    Sélectionnez la catégorie du produit.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div>
                    <FormField
                        control={form.control}
                        name="image"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Image</FormLabel>
                                <FormControl>
                                    <InputGroup>
                                        <InputGroupInput
                                            placeholder="URL de l'image..."
                                            value={field.value ?? ""}
                                            onChange={(e) => { field.onChange(e.target.value) }}
                                        />
                                        <InputGroupAddon align="inline-end">
                                            <InputGroupButton
                                                variant="ghost"
                                                onClick={() => {
                                                    if (field.value) {
                                                        form.trigger("image") // Valide le champ image
                                                        setPreviewImageUrl(field.value) // Met à jour l'aperçu de l'image
                                                    }
                                                }}
                                            >
                                                Aperçu
                                            </InputGroupButton>
                                        </InputGroupAddon>
                                    </InputGroup>
                                </FormControl>
                                <FormDescription>
                                    L&#39;URL de l&#39;image doit être valide.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {previewImageUrl && (
                        <div className="mt-4">
                            <Label htmlFor="preview-img">
                                Aperçu
                            </Label>
                            <div className="w-80 h-80 relative mt-2">
                                <Image src={previewImageUrl} alt={`Aperçu de l'image du produit`} id="preview-img" fill className="object-cover" />
                            </div>
                        </div>
                    )}
                </div>
                <Button type="submit">Envoyer</Button>
            </form>
        </Form>
    );
}

export default ProductForm;