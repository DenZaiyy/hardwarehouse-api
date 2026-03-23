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

export async function createTransaction(data: Partial<TransactionsWithProduct>): Promise<TransactionsWithProduct> {
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

    if (!res.ok) throw new Error("Failed to create transaction");

    return res.json();
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