"use server";

import {Discounts} from "@prisma/client";
import {cookies} from "next/headers";
import {DiscountsWithProductOrCategory, PaginatedResponse} from "@/types/types";

export async function getDiscounts(): Promise<PaginatedResponse<Discounts>> {
    const cookieHeader = await cookies();

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/discounts`,
        {
            method: "GET",
            headers: {
                Cookie: cookieHeader.toString(),
                'x-internal-request': process.env.INTERNAL_API_SECRET!
            },
            cache: "no-store"
        }
    );

    if (!res.ok) throw new Error("Échec de la récupération des remises");

    return res.json();
}

export async function getDiscount(id: string): Promise<DiscountsWithProductOrCategory> {
    const cookieHeader = await cookies();

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/discounts/${id}`,
        {
            method: "GET",
            headers: {
                Cookie: cookieHeader.toString()
            },
            cache: "no-store"
        }
    );

    if (!res.ok) throw new Error("Échec de récupération de la remise");

    return res.json();
}

export async function createDiscount(data: Partial<Discounts>): Promise<Discounts> {
    const cookieHeader = await cookies();

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/discounts`, {
        method: "POST",
        headers: {
            Cookie: cookieHeader.toString(),
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data),
        cache: "no-store"
    });

    if (!res.ok) throw new Error("Échec de la création de la remise");

    return res.json();
}

export async function updateDiscount(id: string, data: Partial<Discounts>): Promise<Discounts> {
    const cookieHeader = await cookies();

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/discounts/${id}`,
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

export async function deleteDiscount(id: string): Promise<void> {
    const cookieHeader = await cookies();

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/discounts/${id}`,
        {
            method: "DELETE",
            headers: {
                Cookie: cookieHeader.toString()
            },
            cache: "no-store"
        }
    );

    if (!res.ok) throw new Error("Échec de la suppression de la remise");
}