"use client"

import {useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Categories} from "@prisma/client";
import toast from "react-hot-toast";
import React from "react";
import {createCategory, updateCategory} from "@/services/category.service";
import {categorySchema} from "@/lib/validators/categorySchema";
import ImageUpload from "../products/image-upload";
import {Switch} from "@/components/ui/switch";

// Fonction d'upload côté client (les File ne peuvent pas être envoyés via Server Actions)
async function uploadCategoryLogoClient(
    slug: string,
    logo: File
): Promise<{ success: boolean; logo?: string; error?: string }> {
    const formData = new FormData();
    formData.append('logo', logo);

    try {
        const res = await fetch(`/api/v1/upload/categories/${slug}`, {
            method: "POST",
            body: formData,
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            return { success: false, error: errorData.error || "Échec de l'upload du logo" };
        }

        return res.json();
    } catch (error) {
        console.error('[UPLOAD] Error:', error);
        return { success: false, error: "Erreur réseau lors de l'upload" };
    }
}

type CategoryFormProps = {
    category?: Categories
    method: "POST" | "PATCH"
}

const CategoryForm = ({ category, method }: CategoryFormProps) => {
    const [logoFile, setLogoFile] = React.useState<File | null>(null);

    const form = useForm<z.infer<typeof categorySchema>>({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            name: category?.name ?? "",
            active: category?.active ?? true,
        }
    })

    async function onSubmit(values: z.infer<typeof categorySchema>) {
        try {
            if (!category) {
                const result = await createCategory({
                    name: values.name,
                    active: values.active,
                });

                if (!result) {
                    toast.error("Une erreur est survenue lors de la création de la catégorie.")
                    return
                }

                if (logoFile) {
                    const logoResult = await uploadCategoryLogoClient(result.slug, logoFile);
                    if (!logoResult.success) {
                        toast.error("Catégorie créée, mais erreur lors de l'upload du logo.")
                    } else {
                        toast.success('Logo uploadé avec succès.')
                    }
                }

                toast.success("Catégorie créée avec succès.")
                form.reset()
                setLogoFile(null)
            } else {
                const result = await updateCategory(category.slug, {
                    name: values.name,
                    active: values.active,
                });

                if (!result) {
                    toast.error("Une erreur est survenue lors de la mise à jour de la catégorie.")
                    return
                }

                if (logoFile) {
                    const logoResult = await uploadCategoryLogoClient(result.slug, logoFile);
                    if (!logoResult.success) {
                        toast.error("Catégorie mise à jour, mais erreur lors de l'upload du logo.")
                    } else {
                        toast.success('Logo uploadé avec succès.')
                    }
                }

                toast.success("Catégorie mise à jour avec succès.")
                form.reset()
                setLogoFile(null)
            }
        } catch (error) {
            console.error('[CategoryForm]', error);
            toast.error("Une erreur est survenue.")
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} method={method} className="space-y-8">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem className="w-full">
                            <FormLabel>Nom de la catégorie</FormLabel>
                            <FormControl>
                                <Input placeholder="Nom de la catégorie" type="text" {...field} />
                            </FormControl>
                            <FormDescription>
                                Le nom de la catégorie doit contenir au moins 2 caractères.
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
                            <FormLabel>Catégorie actif</FormLabel>
                            <FormControl>
                                <Switch
                                    defaultChecked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            <FormDescription>
                                Définir si la catégorie est visible ou non.
                            </FormDescription>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <div>
                    <ImageUpload
                        mode="logo"
                        onLogoChange={setLogoFile}
                        logoPreview={category?.logo}
                    />
                </div>
                <Button type="submit">Envoyer</Button>
            </form>
        </Form>
    );
}

export default CategoryForm;