"use client"

import {useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {Brands} from "@/app/generated/prisma/client";
import toast from "react-hot-toast";
import React from "react";
import {createBrand, updateBrand} from "@/services/brand.service";
import {Brand, brandSchema} from "@/lib/validators/brandSchema";
import ImageUpload from "../products/image-upload";
import {Switch} from "@/components/ui/switch";

// Fonction d'upload côté client (les File ne peuvent pas être envoyés via Server Actions)
async function uploadBrandLogoClient(
    slug: string,
    logo: File
): Promise<{ success: boolean; logo?: string; error?: string }> {
    const formData = new FormData();
    formData.append('logo', logo);

    try {
        const res = await fetch(`/api/v1/upload/brands/${slug}`, {
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

type BrandFormProps = {
    brand?: Brands
    method: "POST" | "PATCH"
}

const BrandForm = ({ brand, method }: BrandFormProps) => {
    const [logoFile, setLogoFile] = React.useState<File | null>(null);

    const form = useForm<Brand>({
        resolver: zodResolver(brandSchema),
        defaultValues: {
            name: brand?.name ?? "",
            active: brand?.active ?? true,
        }
    })

    async function onSubmit(values: z.infer<typeof brandSchema>) {
        try {
            if (!brand) {
                const result = await createBrand({
                    name: values.name,
                    active: values.active,
                });

                if (!result) {
                    toast.error("Une erreur est survenue lors de la création de la marque.")
                    return
                }

                if (logoFile) {
                    const logoResult = await uploadBrandLogoClient(result.slug, logoFile);
                    if (!logoResult.success) {
                        toast.error("Marque créée, mais erreur lors de l'upload du logo.")
                    } else {
                        toast.success('Logo uploadé avec succès.')
                    }
                }

                toast.success("Marque créée avec succès.")
                form.reset()
                setLogoFile(null)
            } else {
                const result = await updateBrand(brand.slug, {
                    name: values.name,
                    active: values.active,
                });

                if (!result) {
                    toast.error("Une erreur est survenue lors de la mise à jour de la marque.")
                    return
                }

                if (logoFile) {
                    const logoResult = await uploadBrandLogoClient(result.slug, logoFile);
                    if (!logoResult.success) {
                        toast.error("Marque mise à jour, mais erreur lors de l'upload du logo.")
                    } else {
                        toast.success('Logo uploadé avec succès.')
                    }
                }

                toast.success("Marque mise à jour avec succès.")
                form.reset()
                setLogoFile(null)
            }
        } catch (error) {
            console.error('[BrandForm]', error);
            toast.error("Une erreur est survenue.")
        }
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} method={method} className="space-y-8">
                <div className="flex gap-4 w-full">
                    <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                            <FormItem className="w-3/4">
                                <FormLabel>Nom de la marque</FormLabel>
                                <FormControl>
                                    <Input placeholder="Nom de la marque" type="text" {...field} />
                                </FormControl>
                                <FormDescription>
                                    Le nom de la marque doit contenir au moins 2 caractères.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="active"
                        render={({ field }) => (
                            <FormItem className="w-1/4">
                                <FormLabel>Marque active</FormLabel>
                                <FormControl>
                                    <Switch
                                        defaultChecked={field.value}
                                        onCheckedChange={field.onChange}
                                    />
                                </FormControl>
                                <FormDescription>
                                    Définir si la marque est afficher ou non.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div>
                    <ImageUpload
                        mode="logo"
                        onLogoChange={setLogoFile}
                        logoPreview={brand?.logo}
                    />
                </div>
                <Button type="submit">Envoyer</Button>
            </form>
        </Form>
    );
}

export default BrandForm;