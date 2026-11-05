"use server"

import {PaginatedResponse, TransactionsWithProduct} from "@/types/types";
import {cookies} from "next/headers";
import {Transactions} from "@prisma/client";

export async function getTransactions(): Promise<TransactionsWithProduct[]>  {
    const cookieHeader = await cookies();

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/transactions`,
        {
            method: "GET",
            headers: {
                Cookie: cookieHeader.toString()
            },
            cache: "no-store"
        }
    );

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to fetch transactions');
    }

    return res.json();
}

export async function getTransaction(id: string): Promise<TransactionsWithProduct> {
    const cookieHeader = await cookies();

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/transactions/${id}`,
        {
            method: "GET",
            headers: {
                Cookie: cookieHeader.toString()
            },
            cache: "no-store"
        }
    );

    if (!res.ok) throw new Error("Failed to fetch transaction");

    return res.json();
}

// Rend le message de l'API au lieu de lever une exception, dont le navigateur ne recevrait pas le message en
// production : un mouvement refusé (stock modifié depuis l'ouverture du formulaire, stock insuffisant) s'explique
export async function createTransaction(data: Partial<TransactionsWithProduct>): Promise<{ success: boolean; error?: string }> {
    const cookieHeader = await cookies();

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/transactions`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Cookie: cookieHeader.toString()
        },
        body: JSON.stringify(data),
        cache: "no-store"
    });

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        return { success: false, error: errorData.error || "Échec de l'enregistrement du mouvement" };
    }

    return { success: true };
}

export async function deleteTransaction(id: string): Promise<void> {
    const cookieHeader = await cookies();

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/transactions/${id}`,
        {
            method: "DELETE",
            headers: {
                Cookie: cookieHeader.toString()
            },
            cache: "no-store"
        }
    );

    if (!res.ok) throw new Error("Failed to delete transaction");
}

export async function getTransactionsByProduct(slug: string): Promise<PaginatedResponse<Transactions>>  {
    const cookieHeader = await cookies();

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/transactions/product/${slug}`,
        {
            method: "GET",
            headers: {
                Cookie: cookieHeader.toString()
            },
            cache: "no-store"
        }
    );

    if (!res.ok) {
        const error = await res.json();
        throw new Error(error.error || 'Failed to fetch transactions');
    }

    return res.json();
}