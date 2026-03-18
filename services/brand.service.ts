"use server";

import {Brands} from "@prisma/client";
import {cookies} from "next/headers";
import {PaginatedResponse} from "@/types/types";

export async function getBrands(): Promise<PaginatedResponse<Brands>> {
    const cookieHeader = await cookies();

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/brands`,
        {
            method: "GET",
            headers: {
                Cookie: cookieHeader.toString()
            },
            cache: "no-store"
        }
    );

    if (!res.ok) throw new Error("Échec de la récupération des marques");

    return res.json();
}

export async function getBrand(slug: string): Promise<Brands> {
    const cookieHeader = await cookies();

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/brands/${slug}`,
        {
            method: "GET",
            headers: {
                Cookie: cookieHeader.toString()
            },
            cache: "no-store"
        }
    );

    if (!res.ok) throw new Error("Échec de récupération de la marque");

    return res.json();
}

export async function createBrand(data: Partial<Brands>): Promise<Brands> {
    const cookieHeader = await cookies();

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/brands`, {
        method: "POST",
        headers: {
            Cookie: cookieHeader.toString(),
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data),
        cache: "no-store"
    });

    if (!res.ok) throw new Error("Échec de la création de la marque");

    return res.json();
}

export async function updateBrand(slug: string, data: Partial<Brands>): Promise<Brands> {
    const cookieHeader = await cookies();

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/brands/${slug}`,
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

    if (!res.ok) throw new Error("Échec de la mise à jour de la marque");

    return res.json();
}

export async function uploadBrandLogo(slug: string, logo: File): Promise<{ success: boolean; logo?: string; error?: string }> {
    const cookieHeader = await cookies();

    const formData = new FormData();
    formData.append('logo', logo);

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/upload/brands/${slug}`,
        {
            method: "POST",
            headers: {
                Cookie: cookieHeader.toString()
                // Note: Ne pas définir Content-Type pour FormData, le navigateur le fait automatiquement
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

export async function deleteBrand(slug: string): Promise<void> {
    const cookieHeader = await cookies();

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/brands/${slug}`,
        {
            method: "DELETE",
            headers: {
                Cookie: cookieHeader.toString()
            },
            cache: "no-store"
        }
    );

    if (!res.ok) throw new Error("Échec de la suppression de la marque");
}