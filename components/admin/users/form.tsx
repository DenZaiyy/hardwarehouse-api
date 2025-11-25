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
import {createUser, updateUser} from "@/services/userService";
import {Checkbox} from "@/components/ui/checkbox";
import {userSchema} from "@/lib/validators/userSchema";

type UserFormProps = {
    user?: User
    method: "POST" | "PATCH"
}

const UserForm = ({ user, method }: UserFormProps) => {
    const form = useForm<z.infer<typeof userSchema>>({
        resolver: zodResolver(userSchema),
        defaultValues: {
            firstName: user?.firstName ?? "",
            lastName: user?.lastName ?? "",
            username: user?.username ?? "",
            email: user?.emailAddresses[0].emailAddress ?? "",
            password: "",
            passwordConfirm: "",
            isAdmin: false
        }
    })

    async function onSubmit(values: z.infer<typeof userSchema>) {
        if (!user) {
            const password = values['password'];
            const confirmPassword = values['passwordConfirm'];

            if (password === confirmPassword) {
                const result = await createUser(values)

                if (!result) {
                    toast.error("Une erreur est survenue lors de la création de l'utilisateur.")
                    return
                }

                toast.success("Utilisateur créé avec succès.")
                form.reset()
            } else {
                toast.error('Mot de passe différent')
            }
        } else {
            const result = await updateUser(user.id, values)

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
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="flex flex-col md:flex-row gap-2">
                    <FormField
                        control={form.control}
                        name="lastName"
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
                        name="firstName"
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
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <div className="flex flex-col md:flex-row gap-2">
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel>Mot de passe</FormLabel>
                                <FormControl>
                                    <Input
                                        type="password"
                                        {...field}
                                    />
                                </FormControl>
                                <FormDescription>
                                    Renseignez votre mot de passe
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="passwordConfirm"
                        render={({ field }) => (
                            <FormItem className="w-full">
                                <FormLabel>Confirmer le mot de passe</FormLabel>
                                <FormControl>
                                    <Input
                                        type="password"
                                        {...field}
                                    />
                                </FormControl>
                                <FormDescription>
                                    Pour confirmer, veuillez renseigner à nouveau le mot de passe.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <FormField
                    control={form.control}
                    name="isAdmin"
                    render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                                <Checkbox
                                    checked={field.value}
                                    onCheckedChange={field.onChange}
                                />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                                <FormLabel>
                                    Utilisateur avec droits administrateur
                                </FormLabel>
                                <FormMessage />
                            </div>
                        </FormItem>
                    )}
                />
                <Button type="submit">Envoyer</Button>
            </form>
        </Form>
    );
}

export default UserForm;