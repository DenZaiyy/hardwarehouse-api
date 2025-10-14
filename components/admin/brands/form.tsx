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
import {apiBrandService} from "@/services/brandService";

type BrandFormProps = {
    brand?: Brands
    method: "POST" | "PATCH"
}

const formSchema = z.object({
    name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    logo: z.string().url("L'URL du logo doit être valide").optional().or(z.literal("")),
})

const BrandForm = ({ brand, method }: BrandFormProps) => {
    const [previewImageUrl, setPreviewImageUrl] = React.useState<string | undefined>(undefined);

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: brand?.name ?? "",
            logo: brand?.logo ?? "",
        }
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!brand) {
            const result = await apiBrandService.createBrand(values)

            if (!result) {
                toast.error("Une erreur est survenue lors de la création de la marque.")
                return
            }

            toast.success("Marque créé avec succès.")
            form.reset()

            if (result.redirect) {
                setTimeout(() => window.location.href = result.redirect, 1500)
            }
        } else {
            const result = await apiBrandService.updateBrand(brand.id, values)

            if (!result) {
                toast.error("Une erreur est survenue lors de la mise à jour de la marque.")
                return
            }

            toast.success("Marque mis à jour avec succès.")
            form.reset()
        }
    }

    function handlePreviewImage() {
        form.setValue("logo", previewImageUrl);
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
                                        <InputGroupInput onChange={() => { setPreviewImageUrl(field.value) }} placeholder="URL du logo..." />
                                        <InputGroupAddon align="inline-end">
                                            <InputGroupButton variant="secondary" onClick={() => handlePreviewImage()}>Aperçu</InputGroupButton>
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