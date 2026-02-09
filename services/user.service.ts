"use server";

import type {User} from "@clerk/backend";
import {cookies} from "next/headers";
import {OrdersResponse, TransactionsResponse} from "@/types/types";

export async function getUsers(): Promise<User[]> {
    const cookieHeader = await cookies();

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/`, {
        method: "GET",
        headers: {
            Cookie: cookieHeader.toString()
        },
        cache: "no-store"
    });

    if (!res.ok) {
        throw new Error("Échec de la récupération des utilisateurs");
    }

    return res.json();
}

export async function getUser(id: string): Promise<User> {
    const cookieHeader = await cookies();

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/${id}`, {
        method: "GET",
        headers: {
            Cookie: cookieHeader.toString()
        },
        cache: "no-store"
    });

    if (!res.ok) {
        throw new Error("Échec de la récupération de l'utilisateur");
    }

    return res.json();
}

export async function createUser(data: Partial<User>): Promise<User> {
    const cookieHeader = await cookies();

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Cookie: cookieHeader.toString()
        },
        body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Échec de la création de l'utilisateur");

    return res.json();
}

export async function updateUser(id: string, data: Partial<User>): Promise<User> {
    const cookieHeader = await cookies();

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${id}`,
        {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Cookie: cookieHeader.toString()
            },
            body: JSON.stringify(data),
            cache: "no-store"
        }
    );

    if (!res.ok) throw new Error("Échec de la mise à jour de l'utilisateur");

    return res.json();
}

export async function deleteUser(id: string): Promise<void> {
    const cookieHeader = await cookies();

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${id}`,
        {
            method: "DELETE",
            headers: {
                Cookie: cookieHeader.toString()
            },
            cache: "no-store"
        }
    );

    if (!res.ok) throw new Error("Échec de la suppression de l'utilisateur");
}

export async function getPurchaseOrders(id: string): Promise<OrdersResponse> {
    const cookieHeader = await cookies();

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${id}/orders`, {
            method: "GET",
            headers: {
                Cookie: cookieHeader.toString()
            },
            cache: "no-store"
        }
    );

    if (!res.ok) throw new Error("L'utilisateur n'a pas effectué de bon de commandes");

    return await res.json();
}

export async function getTransactions(id: string): Promise<TransactionsResponse> {
    const cookieHeader = await cookies();

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/users/${id}/transactions`, {
            method: "GET",
            headers: {
                Cookie: cookieHeader.toString()
            },
            cache: "no-store"
        }
    );

    if (!res.ok) throw new Error("L'utilisateur n'a pas effectué de transaction de stocks");

    return await res.json();
}