"use client"

import {useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Button} from "@/components/ui/button";
import toast from "react-hot-toast";
import React from "react";
import {User} from "@clerk/backend";
import {apiUserService} from "@/services/userService";

type UserFormProps = {
    user?: User
    method: "POST" | "PATCH"
}

const formSchema = z.object({
    firstname: z.string().nonempty(),
    lastname: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
    email: z.string().nonempty(),
    username: z.string().nonempty(),
    password: z.string().nonempty(),
})

const UserForm = ({ user, method }: UserFormProps) => {
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            firstname: user?.firstName ?? "",
            lastname: user?.lastName ?? "",
            email: user?.emailAddresses[0].emailAddress ?? "",
            username: user?.username ?? "",
            password: ""
        }
    })

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!user) {
            const result = await apiUserService.createUser(values)

            if (!result) {
                toast.error("Une erreur est survenue lors de la création de l'utilisateur.")
                return
            }

            toast.success("Utilisateur créé avec succès.")
            form.reset()
        } else {
            const result = await apiUserService.updateUser(user.id, values)

            if (!result) {
                toast.error("Une erreur est survenue lors de la mise à jour de l'utilisateur.")
                return
            }

            toast.success("Utilisateur mis à jour avec succès.")
            form.reset()
        }
    }

    return (
        // TODO: Finalize form to create a new user
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} method={method} className="space-y-8">
                <div className="flex flex-col md:flex-row gap-2">
                    <FormField
                        control={form.control}
                        name="username"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel>Nom d&#39;utilisateur</FormLabel>
                                <FormControl>
                                    <Input type="text" {...field} />
                                </FormControl>
                                <FormDescription>
                                    Le nom d&#39;utilisateur doit contenir au moins 2 caractères.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input type="email" {...field} />
                                </FormControl>
                                <FormDescription>
                                    L&#39;adresse email dois être renseigné
                                </FormDescription>
                            </FormItem>
                        )}
                    />
                </div>
                <div className="flex flex-col md:flex-row gap-2">
                    <FormField
                        control={form.control}
                        name="lastname"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel>Nom de famille</FormLabel>
                                <FormControl>
                                    <Input
                                        type="text"
                                        {...field}
                                    />
                                </FormControl>
                                <FormDescription>
                                    Le nom de famille doit être renseigné
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="firstname"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel>Prénom</FormLabel>
                                <FormControl>
                                    <Input
                                        type="text"
                                        {...field}
                                    />
                                </FormControl>
                                <FormDescription>
                                    Le prénom doit être renseigné
                                </FormDescription>
                            </FormItem>
                        )}
                    />
                </div>
                <Button type="submit">Envoyer</Button>
            </form>
        </Form>
    );
}

export default UserForm;