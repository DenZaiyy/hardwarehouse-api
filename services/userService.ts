import toast from "react-hot-toast";
import {User} from "@clerk/backend";

export interface UserService {
    getUsers: () => Promise<User[]>;
    getUser: (id: string) => Promise<User>;
    createUser: (data: Partial<User>) => Promise<User>;
    updateUser: (id: string, data: Partial<User>) => Promise<User>;
    deleteUser: (id: string) => Promise<void>;
}

export const apiUserService: UserService = {
    getUsers: async (): Promise<User[]> => {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/users`,
            { cache: 'default'}
        );

        if (!res.ok) toast.error("Échec de la récupération des utilisateurs");

        return res.json();
    },
    getUser: async (id: string): Promise<User> => {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/users/${id}`,
            { cache: 'default'}
        );

        if (!res.ok) toast.error("Échec de récupération de l'utilisateur");

        return res.json();
    },
    createUser: async (data: Partial<User>): Promise<User> => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!res.ok) toast.error("Échec de la création de l'utilisateur");

        return res.json();
    },
    updateUser: async (
        id: string,
        data: Partial<User>
    ): Promise<User> => {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/users/${id}`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            }
        );

        if (!res.ok) toast.error("Échec de la mise à jour de l'utilisateur");

        return res.json();
    },
    deleteUser: async (id: string): Promise<void> => {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/users/${id}`,
            {
                method: "DELETE",
            }
        );

        if (!res.ok) toast.error("Échec de la suppression de l'utilisateur");
    },
};
