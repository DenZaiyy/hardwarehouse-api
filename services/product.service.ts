"use server";

import {
    PaginatedResponse,
    ProductsWithCategoryAndBrand,
    ProductsWithCategoryAndBrandAndAttributes,
    ProductsWithStocks
} from "@/types/types";
import {cookies} from "next/headers";
import toast from "react-hot-toast";

export async function getProducts(): Promise<PaginatedResponse<ProductsWithCategoryAndBrand>> {
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

export async function getProduct(slug: string): Promise<ProductsWithCategoryAndBrandAndAttributes> {
    const cookieHeader = await cookies();

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/products/${slug}`, {
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

export async function createProduct(data: FormData | Partial<ProductsWithCategoryAndBrandAndAttributes>): Promise<ProductsWithCategoryAndBrandAndAttributes> {
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

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
        method: "POST",
        headers,
        body,
        cache: "no-store"
    });

    if (!res.ok) throw new Error("Failed to create product");

    return res.json();
}

export async function updateProduct(slug: string, data: FormData | Partial<ProductsWithCategoryAndBrandAndAttributes>): Promise<ProductsWithCategoryAndBrandAndAttributes> {
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

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/products/${slug}`,
        {
            method: "PATCH",
            headers,
            body,
            cache: "no-store"
        }
    );

    if (!res.ok) throw new Error("Failed to update product");

    return res.json();
}

export async function deleteProduct(slug: string): Promise<void> {
    const cookieHeader = await cookies();

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/products/${slug}`,
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