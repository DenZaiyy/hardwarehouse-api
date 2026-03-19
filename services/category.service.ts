"use server"

import {Categories} from "@prisma/client";
import {cookies} from "next/headers";
import {PaginatedResponse} from "@/types/types";

export async function getCategories(): Promise<PaginatedResponse<Categories>> {
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

export async function getCategory(slug: string): Promise<Categories> {
    const cookieHeader = await cookies();

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories/${slug}`, {
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
            Cookie: cookieHeader.toString(),
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data),
        cache: "no-store"
    });

    if (!res.ok) throw new Error("Échec de la création de la catégorie");

    return res.json();
}

export async function updateCategory(slug: string, data: Partial<Categories>): Promise<Categories> {
    const cookieHeader = await cookies();

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/categories/${slug}`,
        {
            method: "PATCH",
            headers: {
                Cookie: cookieHeader.toString(),
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data),
            cache: "no-store"
        }
    );

    if (!res.ok) throw Error(await res.json());

    return res.json();
}

export async function uploadCategoryLogo(slug: string, logo: File): Promise<{ success: boolean; logo?: string; error?: string }> {
    const cookieHeader = await cookies();

    const formData = new FormData();
    formData.append('logo', logo);

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/upload/categories/${slug}`,
        {
            method: "POST",
            headers: {
                Cookie: cookieHeader.toString()
            },
            body: formData,
            cache: "no-store"
        }
    );

    if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        return { success: false, error: errorData.error || "Échec de l'upload du logo" };
    }

    return res.json();
}

export async function deleteCategory(slug: string): Promise<void> {
    const cookieHeader = await cookies();

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/categories/${slug}`,
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