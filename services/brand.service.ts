"use server";

import {Brands} from "@/app/generated/prisma/client";
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

export async function createBrand(data: FormData | Partial<Brands>): Promise<Brands> {
    const cookieHeader = await cookies();

    const headers: HeadersInit = {
        Cookie: cookieHeader.toString()
    };

    let body: BodyInit;

    if (data instanceof FormData) {
        // Don't set Content-Type for FormData, let browser set it with boundary
        body = data;
    } else {
        headers["Content-Type"] = "application/json";
        body = JSON.stringify(data);
    }

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/brands`, {
        method: "POST",
        headers,
        body,
        cache: "no-store"
    });

    if (!res.ok) throw new Error("Échec de la création de la marque");

    return res.json();
}

export async function updateBrand(slug: string, data: FormData | Partial<Brands>): Promise<Brands> {
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