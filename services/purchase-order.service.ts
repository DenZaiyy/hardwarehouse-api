"use server"

import {PurchaseOrdersWithProduct} from "@/types/types";
import {cookies} from "next/headers";

export async function getPurchases(): Promise<PurchaseOrdersWithProduct[]> {
    const cookieHeader = await cookies();

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/purchase-orders`,
        {
            method: "GET",
            headers: {
                Cookie: cookieHeader.toString()
            },
            cache: "no-store"
        }
    );

    if (!res.ok) throw new Error("Failed to fetch purchase orders");

    return res.json();
}

export async function getPurchase(id: string): Promise<PurchaseOrdersWithProduct> {
    const cookieHeader = await cookies();

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/purchase-orders/${id}`,
        {
            method: "GET",
            headers: {
                Cookie: cookieHeader.toString()
            },
            cache: "no-store"
        }
    );

    if (!res.ok) throw new Error("Failed to fetch purchase order");

    return res.json();
}

export async function createPurchase(data: Partial<PurchaseOrdersWithProduct>): Promise<PurchaseOrdersWithProduct> {
    const cookieHeader = await cookies();

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/purchase-orders`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Cookie: cookieHeader.toString()
        },
        body: JSON.stringify(data),
        cache: "no-store"
    });

    if (!res.ok) throw new Error("Failed to create purchase order");

    return res.json();
}

export async function deletePurchase(id: string): Promise<void> {
    const cookieHeader = await cookies();

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/purchase-orders/${id}`,
        {
            method: "DELETE",
            headers: {
                Cookie: cookieHeader.toString()
            },
            cache: "no-store"
        }
    );

    if (!res.ok) throw new Error("Failed to delete purchase order");
}