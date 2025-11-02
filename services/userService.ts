import {User} from "@clerk/backend";
import {OrdersResponse, TransactionsResponse} from "@/types/types";

export interface UserService {
    getUsers: () => Promise<User[]>;
    getUser: (id: string) => Promise<User>;
    createUser: (data: Partial<User>) => Promise<User>;
    updateUser: (id: string, data: Partial<User>) => Promise<User>;
    deleteUser: (id: string) => Promise<void>;
    getPurchaseOrders: (id: string) => Promise<OrdersResponse>;
    getTransactions: (id: string) => Promise<TransactionsResponse>
}

export const apiUserService: UserService = {
    getUsers: async (): Promise<User[]> => {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/protected/users`, {
                method: "GET",
                cache: 'default'
            }
        );

        if (!res.ok) throw new Error("Échec de la récupération des utilisateurs");

        return res.json();
    },
    getUser: async (id: string): Promise<User> => {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/protected/users/${id}`,
            { cache: 'default'}
        );

        if (!res.ok) throw new Error("Échec de récupération de l'utilisateur");

        return res.json();
    },
    createUser: async (data: Partial<User>): Promise<User> => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/protected/users`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!res.ok) throw new Error("Échec de la création de l'utilisateur");

        return res.json();
    },
    updateUser: async (
        id: string,
        data: Partial<User>
    ): Promise<User> => {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/protected/users/${id}`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            }
        );

        if (!res.ok) throw new Error("Échec de la mise à jour de l'utilisateur");

        return res.json();
    },
    deleteUser: async (id: string): Promise<void> => {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/protected/users/${id}`,
            {
                method: "DELETE",
            }
        );

        if (!res.ok) throw new Error("Échec de la suppression de l'utilisateur");
    },
    getPurchaseOrders: async (id: string): Promise<OrdersResponse> => {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/protected/users/${id}/orders`,
            { cache: "default"}
        );

        if (!res.ok) throw new Error("L'utilisateur n'a pas effectué de bon de commandes");

        return await res.json();
    },
    getTransactions: async (id: string): Promise<TransactionsResponse> => {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/protected/users/${id}/transactions`,
            { cache: "default" }
        );

        if (!res.ok) throw new Error("L'utilisateur n'a pas effectué de transaction de stocks");

        return await res.json();
    }
};
