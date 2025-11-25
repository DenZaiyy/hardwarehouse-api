import {z} from "zod";

export const userSchema = z.object({
    firstName: z.string().min(2, {message: "Le prénom doit contenir au moins 2 caractères"}),
    lastName: z.string().min(2, {message: "Le nom doit contenir au moins 2 caractères"}),
    username: z.string().min(5, {message: "Le pseudo doit contenir au moins 5 caractères"}),
    email: z.email({message: "Email invalide"}),
    password: z.string().min(8, {message: "Le mot de passe doit contenir au minimum 8 caractères"}),
    passwordConfirm: z.string().min(8, {message: "Le mot de passe doit contenir au minimum 8 caractères"}),
    isAdmin: z.boolean()
}).refine((data) => data.password === data.passwordConfirm, {
    message: "Les mots de passe ne correspondent pas",
    path: ["passwordConfirm"]
});

export type User = z.infer<typeof userSchema>;