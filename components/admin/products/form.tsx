"use client"

import {useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {ProductInput, ProductsWithCategoryAndBrandAndAttributes} from "@/types/types";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {InputGroup, InputGroupAddon, InputGroupInput, InputGroupText} from "@/components/ui/input-group";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {AttributeType, Brands, Categories} from "@prisma/client";
import toast from "react-hot-toast";
import React, {useEffect, useState} from "react";
import {Label} from "@/components/ui/label";
import {Switch} from "@/components/ui/switch";
import {createProduct, updateProduct} from "@/services/product.service";
import {productSchema} from "@/lib/validators/productSchema";
import {Textarea} from "@/components/ui/textarea";
import ImageUpload from "./image-upload";

// Fonction d'upload côté client (les File ne peuvent pas être envoyés via Server Actions)
async function uploadProductImagesClient(
    slug: string,
    thumbnail?: File | null,
    images?: File[]
): Promise<{ success: boolean; thumbnail?: string; images?: string[]; error?: string }> {
    const formData = new FormData();

    if (thumbnail) {
        formData.append('thumbnail', thumbnail);
    }

    if (images && images.length > 0) {
        images.forEach((file) => {
            formData.append('images', file);
        });
    }

    // Vérifier qu'il y a au moins un fichier
    if (!thumbnail && (!images || images.length === 0)) {
        return { success: true }; // Rien à uploader
    }

    try {
        const res = await fetch(`/api/v1/upload/products/${slug}`, {
            method: "POST",
            body: formData,
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            return { success: false, error: errorData.error || "Échec de l'upload des images" };
        }

        return res.json();
    } catch (error) {
        console.error('[UPLOAD] Error:', error);
        return { success: false, error: "Erreur réseau lors de l'upload" };
    }
}

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
    const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>(product?.category.slug ?? "");
    const [isAttributesLoaded, setIsAttributesLoaded] = useState(false);

    const form = useForm<z.infer<typeof productSchema>>({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: product?.name ?? "",
            price: product?.price ?? 0,
            description: product?.description ?? "",
            shortDescription: product?.shortDescription ?? "",
            attributes: {},
            active: product?.active ?? true,
            brandId: product?.brand.id ?? "",
            category: product?.category.slug ?? "",
        }
    })

    // Fonction pour récupérer les attributs d'une catégorie
    const fetchCategoryAttributes = async (categorySlug: string) => {
        if (!categorySlug) {
            setCategoryAttributes([]);
            return;
        }

        try {
            const response = await fetch(`/api/v1/categories/${categorySlug}/attributes`);
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
        if (selectedCategorySlug) {
            fetchCategoryAttributes(selectedCategorySlug);
        }
    }, [selectedCategorySlug]);

    // Hydrater les valeurs d'attributs existantes du produit (en mode édition)
    useEffect(() => {
        if (product?.productAttributeValues && categoryAttributes.length > 0 && !isAttributesLoaded) {
            const existingValues: Record<string, string> = {};

            product.productAttributeValues.forEach((pav) => {
                // Utiliser categoryAttributeId directement ou categoryAttribute.id comme fallback
                const categoryAttrId = (pav as { categoryAttributeId?: string }).categoryAttributeId
                    || pav.categoryAttribute?.id;

                if (categoryAttrId) {
                    existingValues[categoryAttrId] = pav.value;
                }
            });

            setAttributeValues(existingValues);
            setIsAttributesLoaded(true);
            console.log('[FORM] Hydrated attribute values:', existingValues);
        }
    }, [product?.productAttributeValues, categoryAttributes, isAttributesLoaded]);

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

        try {
            // Préparer les données JSON (sans fichiers)
            const productData: ProductInput = {
                name: values.name,
                price: values.price,
                active: values.active,
                brandId: values.brandId,
                category: values.category,
                description: values.description || undefined,
                shortDescription: values.shortDescription || undefined,
                attributes: Object.keys(attributeValues).length > 0 ? attributeValues : undefined,
            };

            if (!product) {
                // 1. Créer le produit en JSON
                console.log('[FORM] Creating product with JSON:', productData);
                const result = await createProduct(productData);

                if (!result) {
                    toast.error("Une erreur est survenue lors de la création du produit.")
                    return;
                }

                // 2. Upload les images séparément si présentes
                if (thumbnailFile || imageFiles.length > 0) {
                    const uploadResult = await uploadProductImagesClient(
                        result.slug,
                        thumbnailFile,
                        imageFiles
                    );

                    if (!uploadResult.success) {
                        toast.error("Produit créé, mais erreur lors de l'upload des images.");
                    }
                }

                toast.success("Produit créé avec succès.");
                form.reset();
                setAttributeValues({});
                setThumbnailFile(null);
                setImageFiles([]);
            } else {
                // 1. Mettre à jour le produit en JSON
                console.log('[FORM] Updating product with JSON:', productData);
                const result = await updateProduct(product.slug, productData);

                if (!result) {
                    toast.error("Une erreur est survenue lors de la mise à jour du produit.")
                    return;
                }

                // 2. Upload les nouvelles images si présentes
                if (thumbnailFile || imageFiles.length > 0) {
                    const uploadResult = await uploadProductImagesClient(
                        result.slug,
                        thumbnailFile,
                        imageFiles
                    );

                    if (!uploadResult.success) {
                        toast.error("Produit mis à jour, mais erreur lors de l'upload des images.");
                    }
                }

                toast.success("Produit mis à jour avec succès.");
                form.reset();
                setAttributeValues({});
                setThumbnailFile(null);
                setImageFiles([]);
            }
        } catch (error) {
            console.error('[ProductForm]', error);
            toast.error("Une erreur est survenue.");
        }
    }

    const [thumbnailFile, setThumbnailFile] = React.useState<File | null>(null);
    const [imageFiles, setImageFiles] = React.useState<File[]>([]);
    const shortDescription = form.watch("shortDescription") || "";
    const shortDescriptionMaxLength = 255;
    const description = form.watch("description") || "";

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
                        name="category"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel>Catégorie</FormLabel>
                                <FormControl>
                                    <Select
                                        onValueChange={(value) => {
                                            field.onChange(value);
                                            setSelectedCategorySlug(value);
                                            setAttributeValues({}); // Reset attribute values when category changes
                                            setIsAttributesLoaded(false); // Reset pour permettre la réhydratation si on revient à la catégorie originale
                                        }}
                                        value={field.value}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Sélectionner une catégorie" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories && (
                                                categories.map((category) => (
                                                    <SelectItem key={category.id} value={category.slug}>{category.name}</SelectItem>
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
                <div className="space-y-4 md:space-y-0 md:flex md:gap-4">
                    <FormField control={form.control} name="description" render={({ field }) => (
                        <FormItem className="w-full">
                            <FormLabel>Description ({description.length} caractères)</FormLabel>
                            <FormControl>
                                <Textarea cols={10} rows={10} {...field} />
                            </FormControl>
                            <FormDescription>
                                La description détaillée du produit.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                    />
                    <FormField control={form.control} name="shortDescription" render={({ field }) => (
                        <FormItem className="w-full">
                            <FormLabel>Description courte ({shortDescription.length}/{shortDescriptionMaxLength} caractères)</FormLabel>
                            <FormControl>
                                <Textarea className="resize-none" maxLength={shortDescriptionMaxLength} {...field} />
                            </FormControl>
                            <FormDescription>
                                La description courte du produit (max 255 caractères).
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                    />
                </div>
                <div>
                    <ImageUpload
                        mode="product"
                        onThumbnailChange={setThumbnailFile}
                        onImagesChange={setImageFiles}
                        thumbnailPreview={product?.thumbnail}
                        imagesPreview={product?.images || []}
                        maxImages={8}
                    />
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