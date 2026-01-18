"use client"

import {useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {ProductsWithCategoryAndBrandAndAttributes} from "@/types/types";
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
import {AttributeType, Brands, Categories} from "@/app/generated/prisma/client";
import toast from "react-hot-toast";
import React, {useEffect, useState} from "react";
import {Label} from "@/components/ui/label";
import Image from "next/image";
import {Switch} from "@/components/ui/switch";
import {createProduct, updateProduct} from "@/services/productService";
import {productSchema} from "@/lib/validators/productSchema";

type CategoryAttribute = {
    id: string;
    attributeId: string;
    name: string;
    type: AttributeType;
    required: boolean;
    displayOrder: number;
}

type ProductFormProps = {
    product?: ProductsWithCategoryAndBrandAndAttributes
    brands: Brands[]
    categories: Categories[]
    method: "POST" | "PATCH"
}

const ProductForm = ({ product, brands, categories, method }: ProductFormProps) => {
    const [categoryAttributes, setCategoryAttributes] = useState<CategoryAttribute[]>([]);
    const [attributeValues, setAttributeValues] = useState<Record<string, string>>({});
    const [selectedCategoryId, setSelectedCategoryId] = useState<string>(product?.category.id ?? "");

    const form = useForm<z.infer<typeof productSchema>>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: product?.name ?? "",
            price: product?.price ?? 0,
            active: product?.active,
            image: product?.image ?? "",
            brandId: product?.brand.id ?? "",
            categoryId: product?.category.id ?? "",
            attributes: {},
        }
    })

    // Fonction pour récupérer les attributs d'une catégorie
    const fetchCategoryAttributes = async (categoryId: string) => {
        if (!categoryId) {
            setCategoryAttributes([]);
            return;
        }

        try {
            const response = await fetch(`/api/v1/categories/${categoryId}/attributes`);
            if (response.ok) {
                const attributes = await response.json();
                setCategoryAttributes(attributes);
            } else {
                setCategoryAttributes([]);
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des attributs:", error);
            setCategoryAttributes([]);
        }
    };

    // Charger les attributs lors du changement de catégorie
    useEffect(() => {
        if (selectedCategoryId) {
            fetchCategoryAttributes(selectedCategoryId);
        }
    }, [selectedCategoryId]);

    async function onSubmit(values: z.infer<typeof productSchema>) {
        // Validate required attributes
        const requiredAttributeErrors: string[] = [];
        categoryAttributes.forEach(attr => {
            if (attr.required && (!attributeValues[attr.id] || attributeValues[attr.id].trim() === "")) {
                requiredAttributeErrors.push(attr.name);
            }
        });

        if (requiredAttributeErrors.length > 0) {
            toast.error(`Attributs requis manquants: ${requiredAttributeErrors.join(", ")}`);
            return;
        }

        // Include attribute values in the submission
        const submitData = {
            ...values,
            attributes: attributeValues
        };

        if (!product) {
            console.table(submitData);
            const result = await createProduct(submitData)

            console.table(result)

            if (!result) {
                toast.error("Une erreur est survenue lors de la création du produit.")
                return
            }

            toast.success("Produit créé avec succès.")
            form.reset()
            setAttributeValues({})
        } else {
            const result = await updateProduct(product.slug, submitData)

            if (!result) {
                toast.error("Une erreur est survenue lors de la mise à jour du produit.")
                return
            }

            toast.success("Produit mis à jour avec succès.")
            form.reset()
            setAttributeValues({})
        }
    }

    const [previewImageUrl, setPreviewImageUrl] = React.useState<string | null>(null)

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} method={method} className="space-y-4">
                <div className="space-y-4 md:space-y-0 md:flex md:gap-4">
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
                                <FormLabel>Prix HT</FormLabel>
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
                    <FormField
                        control={form.control}
                        name="active"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel>Produit actif</FormLabel>
                                <FormControl>
                                    <Switch
                                        defaultChecked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <FormDescription>
                                    Définir si le produit est disponible à la vente ou non.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="space-y-4 md:space-y-0 md:flex md:gap-4">
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
                                        onValueChange={(value) => {
                                            field.onChange(value);
                                            setSelectedCategoryId(value);
                                            setAttributeValues({}); // Reset attribute values when category changes
                                        }}
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

                {/* Attributs dynamiques par catégorie */}
                {categoryAttributes.length > 0 && (
                    <div className="space-y-4">
                        <h3 className="text-lg font-medium">Attributs spécifiques</h3>
                        <div className="space-y-4">
                            {categoryAttributes.map((attribute) => (
                                <div key={attribute.id} className="w-full">
                                    <Label htmlFor={`attribute-${attribute.id}`}>
                                        {attribute.name}
                                        {attribute.required && <span className="text-red-500 ml-1">*</span>}
                                    </Label>
                                    {attribute.type === "TEXT" && (
                                        <Input
                                            id={`attribute-${attribute.id}`}
                                            type="text"
                                            placeholder={`Entrez ${attribute.name.toLowerCase()}`}
                                            value={attributeValues[attribute.id] || ""}
                                            onChange={(e) => setAttributeValues(prev => ({
                                                ...prev,
                                                [attribute.id]: e.target.value
                                            }))}
                                            className="mt-2"
                                        />
                                    )}
                                    {attribute.type === "NUMBER" && (
                                        <Input
                                            id={`attribute-${attribute.id}`}
                                            type="number"
                                            placeholder={`Entrez ${attribute.name.toLowerCase()}`}
                                            value={attributeValues[attribute.id] || ""}
                                            onChange={(e) => setAttributeValues(prev => ({
                                                ...prev,
                                                [attribute.id]: e.target.value
                                            }))}
                                            className="mt-2"
                                        />
                                    )}
                                    {attribute.type === "BOOLEAN" && (
                                        <div className="flex items-center space-x-2 mt-2">
                                            <Switch
                                                id={`attribute-${attribute.id}`}
                                                checked={attributeValues[attribute.id] === "true"}
                                                onCheckedChange={(checked) => setAttributeValues(prev => ({
                                                    ...prev,
                                                    [attribute.id]: checked.toString()
                                                }))}
                                            />
                                        </div>
                                    )}
                                    {attribute.type === "SELECT" && (
                                        <Select
                                            value={attributeValues[attribute.id] || ""}
                                            onValueChange={(value) => setAttributeValues(prev => ({
                                                ...prev,
                                                [attribute.id]: value
                                            }))}
                                        >
                                            <SelectTrigger className="w-full mt-2">
                                                <SelectValue placeholder={`Sélectionner ${attribute.name.toLowerCase()}`} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="option1">Option 1</SelectItem>
                                                <SelectItem value="option2">Option 2</SelectItem>
                                                <SelectItem value="option3">Option 3</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <Button type="submit">Envoyer</Button>
            </form>
        </Form>
    );
}

export default ProductForm;