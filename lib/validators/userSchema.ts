import {z} from "zod";

export const userSchema = z.object({
    firstName: z.string().min(2, {error: "Le prénom doit contenir au moins 2 caractères"}),
    lastName: z.string().min(2, {error: "Le nom doit contenir au moins 2 caractères"}),
    username: z.string().min(5, {error: "Le pseudo doit contenir au moins 5 caractères"}),
    email: z.email({error: "Email invalide"}),
    password: z.string().min(8, {error: "Le mot de passe doit contenir au minimum 8 caractères"}),
    passwordConfirm: z.string().min(8, {error: "Le mot de passe doit contenir au minimum 8 caractères"}),
    isAdmin: z.boolean()
}).refine((data) => data.password === data.passwordConfirm, {
    error: "Les mots de passe ne correspondent pas",
    path: ["passwordConfirm"]
});

export type User = z.infer<typeof userSchema>;

// Pas de passwordConfirm ni isAdmin (rôle non modifiable ici) ; `locked` est propre au verrouillage Clerk.
export const userPatchSchema = z.object({
    username: z.string().trim().min(5, { error: "Le pseudo doit contenir au moins 5 caractères" }).optional(),
    emailAddress: z.email({ error: "Email invalide" }).optional(),
    firstName: z.string().trim().min(2, { error: "Le prénom doit contenir au moins 2 caractères" }).optional(),
    lastName: z.string().trim().min(2, { error: "Le nom doit contenir au moins 2 caractères" }).optional(),
    password: z.string().min(8, { error: "Le mot de passe doit contenir au minimum 8 caractères" }).optional(),
    locked: z.boolean().optional(),
});