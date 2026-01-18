"use client"

import {useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import {InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput} from "@/components/ui/input-group";
import Image from "next/image";
import {Label} from "@/components/ui/label";
import {Categories} from "@/app/generated/prisma/client";
import toast from "react-hot-toast";
import React from "react";
import {createCategory, updateCategory} from "@/services/categoryService";
import {categorySchema} from "@/lib/validators/categorySchema";

type CategoryFormProps = {
    category?: Categories
    method: "POST" | "PATCH"
}

const CategoryForm = ({ category, method }: CategoryFormProps) => {
    const [previewImageUrl, setPreviewImageUrl] = React.useState<string | undefined>(undefined);

    const form = useForm<z.infer<typeof categorySchema>>({
        resolver: zodResolver(categorySchema),
        defaultValues: {
            name: category?.name ?? "",
            logo: category?.logo ?? "",
        }
    })

    async function onSubmit(values: z.infer<typeof categorySchema>) {
        if (!category) {
            const result = await createCategory(values)

            if (!result) {
                toast.error("Une erreur est survenue lors de la création de la catégorie.")
                return
            }

            toast.success("Catégorie créé avec succès.")
            form.reset()
        } else {
            const result = await updateCategory(category.slug, values)

            if (!result) {
                toast.error("Une erreur est survenue lors de la mise à jour de la catégorie.")
                return
            }

            form.reset()
            toast.success("Catégorie mis à jour avec succès.")
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
                <div>
                    <FormField
                        control={form.control}
                        name="logo"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Logo</FormLabel>
                                <FormControl>
                                    <InputGroup>
                                        <InputGroupInput
                                            placeholder="URL du logo..."
                                            value={field.value ?? ""}
                                            onChange={(e) => { field.onChange(e.target.value) }}
                                        />
                                        <InputGroupAddon align="inline-end">
                                            <InputGroupButton
                                                variant="ghost"
                                                onClick={() => {
                                                    if (field.value) {
                                                        form.trigger("logo") // Valide le champ image
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
                                    L&#39;URL du logo doit être valide.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    {previewImageUrl && (
                        <div className="mt-4">
                            <Label htmlFor="preview-img">Aperçu</Label>
                            <div className="w-80 h-80 relative mt-2">
                                <Image src={previewImageUrl} alt="Image du produit" id="preview-img" fill={true} className="object-cover" />
                            </div>
                        </div>
                    )}
                </div>
                <Button type="submit">Envoyer</Button>
            </form>
        </Form>
    );
}

export default CategoryForm;