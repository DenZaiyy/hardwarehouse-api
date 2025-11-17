"use server"

import {Categories} from "@/app/generated/prisma/client";
import {cookies} from "next/headers";

export async function getCategories(): Promise<Categories[]> {
    const cookieHeader = await cookies();

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
        method: "GET",
        headers: {
            Cookie: cookieHeader.toString()
        },
        cache: "no-store"
    });

    if (!res.ok) throw new Error("Échec de la récupération des catégories");

    return res.json();
}

export async function getCategory(id: string): Promise<Categories> {
    const cookieHeader = await cookies();

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories/${id}`, {
        method: "GET",
        headers: {
            Cookie: cookieHeader.toString()
        },
        cache: "no-store"
    });

    if (!res.ok) throw new Error("Échec de récupération de la catégorie");

    return res.json();
}

export async function createCategory(data: Partial<Categories>): Promise<Categories> {
    const cookieHeader = await cookies();

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Cookie: cookieHeader.toString()
        },
        body: JSON.stringify(data),
        cache: "no-store"
    });

    if (!res.ok) throw new Error("Échec de la création de la catégorie");

    return res.json();
}

export async function updateCategory(id: string, data: Partial<Categories>): Promise<Categories> {
    const cookieHeader = await cookies();

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/categories/${id}`,
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

    if (!res.ok) throw new Error("Échec de la mise à jour de la catégorie");

    return res.json();
}

export async function deleteCategory(id: string): Promise<void> {
    const cookieHeader = await cookies();

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/categories/${id}`,
        {
            method: "DELETE",
            headers: {
                Cookie: cookieHeader.toString()
            },
            cache: "no-store"
        }
    );

    if (!res.ok) throw new Error("Échec de la suppression de la catégorie");
}