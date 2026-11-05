"use server";

import {StocksWithProduct} from "@/types/types";
import {cookies} from "next/headers";

export async function getStocks(): Promise<StocksWithProduct[]> {
    const cookieHeader = await cookies();

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/stocks`,
        {
            method: "GET",
            headers: {
                Cookie: cookieHeader.toString()
            },
            cache: "no-store"
        }
    );

    if (!res.ok) throw new Error("Failed to fetch stocks");

    return res.json();
}

export async function getStock(id: string): Promise<StocksWithProduct> {
    const cookieHeader = await cookies();

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/stocks/${id}`,
        {
            method: "GET",
            headers: {
                Cookie: cookieHeader.toString()
            },
            cache: "no-store"
        }
    );

    if (!res.ok) throw new Error("Failed to fetch stock");

    return res.json();
}

// Les écritures rendent le message de l'API au lieu de lever une exception : en production, le navigateur ne reçoit
// pas le message d'une action serveur en échec, et un refus comme le 409 d'un stock modifié entre-temps serait muet

export async function createStock(data: Partial<StocksWithProduct>): Promise<{ success: boolean; error?: string }> {
    const cookieHeader = await cookies();

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stocks`, {
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
        return { success: false, error: errorData.error || "Échec de la création du stock" };
    }

    return { success: true };
}

export async function updateStock(id: string, data: Partial<StocksWithProduct>): Promise<{ success: boolean; error?: string }> {
    const cookieHeader = await cookies();

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/stocks/${id}`,
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

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        return { success: false, error: errorData.error || "Échec de la mise à jour du stock" };
    }

    return { success: true };
}

export async function deleteStock(id: string): Promise<{ success: boolean; error?: string }> {
    const cookieHeader = await cookies();

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/stocks/${id}`,
        {
            method: "DELETE",
            headers: {
                Cookie: cookieHeader.toString()
            },
            cache: "no-store"
        }
    );

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        return { success: false, error: errorData.error || "Échec de la suppression du stock" };
    }

    return { success: true };
}