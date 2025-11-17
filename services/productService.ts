"use server";

import {ProductsWithCategoryAndBrand, ProductsWithStocks} from "@/types/types";
import {cookies} from "next/headers";
import toast from "react-hot-toast";

export async function getProducts(): Promise<ProductsWithCategoryAndBrand[]> {
    const cookieHeader = await cookies();

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/products`,
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
        throw new Error(error.error || 'Failed to fetch products');
    }

    return res.json();
}

export async function getProduct(id: string): Promise<ProductsWithCategoryAndBrand> {
    const cookieHeader = await cookies();

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/products/${id}`, {
            method: "GET",
            headers: {
                Cookie: cookieHeader.toString()
            },
            cache: "no-store"
        }
    );

    if (!res.ok) throw new Error("Failed to fetch product");

    return res.json();
}

export async function createProduct(data: Partial<ProductsWithCategoryAndBrand>): Promise<ProductsWithCategoryAndBrand> {
    const cookieHeader = await cookies();

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Cookie: cookieHeader.toString()
        },
        body: JSON.stringify(data),
        cache: "no-store"
    });

    if (!res.ok) throw new Error("Failed to create product");

    return res.json();
}

export async function updateProduct(id: string, data: Partial<ProductsWithCategoryAndBrand>): Promise<ProductsWithCategoryAndBrand> {
    const cookieHeader = await cookies();

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/products/${id}`,
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

    if (!res.ok) throw new Error("Failed to update product");

    return res.json();
}

export async function deleteProduct(id: string): Promise<void> {
    const cookieHeader = await cookies();

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/products/${id}`,
        {
            method: "DELETE",
            headers: {
                Cookie: cookieHeader.toString()
            },
            cache: "no-store"
        }
    );

    if (!res.ok) {
        toast.error('Failed to delete product');
        throw new Error("Failed to delete product");
    }
}

export async function getProductStock(id: string): Promise<ProductsWithStocks> {
    const cookieHeader = await cookies();

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/stats/product/${id}`, {
            method: "GET",
            headers: {
                Cookie: cookieHeader.toString()
            },
            cache: "no-store"
        }
    )

    if (!res.ok) throw new Error("Failed to fetch product stocks")

    return res.json();
}