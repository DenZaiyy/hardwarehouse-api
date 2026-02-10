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
        }
    })

    async function onSubmit(values: z.infer<typeof brandSchema>) {
        // Create FormData for file upload
        const formData = new FormData();
        
        // Add text fields
        formData.append('name', values.name);
        
        // Add logo file if present
        if (logoFile) {
            formData.append('logo', logoFile);
        }

        if (!brand) {
            const result = await createBrand(formData)

            if (!result) {
                toast.error("Une erreur est survenue lors de la création de la marque.")
                return
            }

            toast.success("Marque créée avec succès.")
            form.reset()
            setLogoFile(null)
        } else {
            const result = await updateBrand(brand.slug, formData)

            if (!result) {
                toast.error("Une erreur est survenue lors de la mise à jour de la marque.")
                return
            }

            toast.success("Marque mise à jour avec succès.")
            form.reset()
            setLogoFile(null)
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