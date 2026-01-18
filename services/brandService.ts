"use server";

import {Brands} from "@/app/generated/prisma/client";
import {cookies} from "next/headers";

export async function getBrands(): Promise<Brands[]> {
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
            "Content-Type": "application/json",
            Cookie: cookieHeader.toString()
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