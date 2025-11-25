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
import {Brands} from "@/app/generated/prisma/client";
import toast from "react-hot-toast";
import React from "react";
import {createBrand, updateBrand} from "@/services/brandService";
import {brandSchema} from "@/lib/validators/brandSchema";

type BrandFormProps = {
    brand?: Brands
    method: "POST" | "PATCH"
}

const BrandForm = ({ brand, method }: BrandFormProps) => {
    const [previewImageUrl, setPreviewImageUrl] = React.useState<string | null>(null)

    const form = useForm<z.infer<typeof brandSchema>>({
        resolver: zodResolver(brandSchema),
        defaultValues: {
            name: brand?.name ?? "",
            logo: brand?.logo ?? "",
        }
    })

    async function onSubmit(values: z.infer<typeof brandSchema>) {
        if (!brand) {
            const result = await createBrand(values)

            if (!result) {
                toast.error("Une erreur est survenue lors de la création de la marque.")
                return
            }

            toast.success("Marque créé avec succès.")
            form.reset()
        } else {
            const result = await updateBrand(brand.id, values)

            if (!result) {
                toast.error("Une erreur est survenue lors de la mise à jour de la marque.")
                return
            }

            toast.success("Marque mis à jour avec succès.")
            form.reset()
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

export default BrandForm;