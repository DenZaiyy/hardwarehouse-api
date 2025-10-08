"use client"

import {useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {ProductsWithCategoryAndBrand} from "@/types/types";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {InputGroup, InputGroupAddon, InputGroupInput, InputGroupText} from "@/components/ui/input-group";
import Image from "next/image";
import {Label} from "@/components/ui/label";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {Brands, Categories} from "@/app/generated/prisma/client";

type ProductFormProps = {
    product: ProductsWithCategoryAndBrand
    brands: Brands[]
    categories: Categories[]
}

const formSchema = z.object({
    name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    price: z.float64().min(0, "Le prix doit être un nombre positif"),
    image: z.string().url("L'URL de l'image doit être valide").optional().or(z.literal("")),
    brand: z.object<Brands>().required(),
    category: z.object<Categories>().required(),
})

const ProductForm = ({ product, brands, categories }: ProductFormProps) => {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: product.name,
            price: product.price,
            image: product.image || "",
            brand: product.brand,
            category: product.category,
        }
    })

    function onSubmit(values: z.infer<typeof formSchema>) {
        console.log(values)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="flex gap-4">
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
                                        <InputGroupInput type="number" placeholder="0.00" {...field} />
                                        <InputGroupAddon align="inline-end">
                                            <InputGroupText>€</InputGroupText>
                                        </InputGroupAddon>
                                    </InputGroup>
                                </FormControl>
                                <FormDescription>
                                    Le nom du produit doit contenir au moins 2 caractères.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="flex gap-4">
                    <FormField
                        control={form.control}
                        name="brand"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel>Marque</FormLabel>
                                <FormControl>
                                    <Select>
                                        <SelectTrigger className="w-full">
                                            <SelectValue {...field} placeholder="Sélectionner une marque" />
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
                        name="category"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel>Catégorie</FormLabel>
                                <FormControl>
                                    <Select>
                                        <SelectTrigger className="w-full">
                                            <SelectValue {...field} placeholder="Sélectionner une catégorie" />
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
                                    Sélectionnez la marque du produit.
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
                                    <Input  {...field} />
                                </FormControl>
                                <FormDescription>
                                    L&#39;URL de l&#39;image doit être valide.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {form.getValues("image") && (
                        <div className="mt-4">
                            <Label htmlFor="preview-img">Preview</Label>
                            <div className="w-80 h-80 relative mt-2">
                                <Image src={form.getValues("image")!} alt="Image du produit" id="preview-img" fill={true} className="object-cover" />
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