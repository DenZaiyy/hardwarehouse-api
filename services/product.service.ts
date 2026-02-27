"use server";

import {
    PaginatedResponse,
    ProductInput,
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

export async function createProduct(data: ProductInput): Promise<ProductsWithCategoryAndBrandAndAttributes> {
    const cookieHeader = await cookies();

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
        method: "POST",
        headers: {
            Cookie: cookieHeader.toString(),
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data),
        cache: "no-store"
    });

    if (!res.ok) throw new Error("Failed to create product");

    return res.json();
}

export async function updateProduct(slug: string, data: ProductInput): Promise<ProductsWithCategoryAndBrandAndAttributes> {
    const cookieHeader = await cookies();

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/products/${slug}`,
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

    if (!res.ok) throw new Error("Failed to update product", { cause: await res.text() });

    return res.json();
}

interface UploadResult {
    success: boolean;
    thumbnail?: string;
    images?: string[];
    error?: string;
}

export async function uploadProductImages(
    slug: string,
    thumbnail?: File | null,
    images?: File[]
): Promise<UploadResult> {
    const cookieHeader = await cookies();

    const formData = new FormData();

    if (thumbnail) {
        formData.append('thumbnail', thumbnail);
    }

    if (images && images.length > 0) {
        images.forEach((file) => {
            formData.append('images', file);
        });
    }

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/upload/products/${slug}`,
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
        return { success: false, error: errorData.error || "Échec de l'upload des images" };
    }

    return res.json();
}

export async function deleteProductImage(slug: string, filename: string): Promise<{ success: boolean; error?: string }> {
    const cookieHeader = await cookies();

    const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/upload/products/${slug}/${filename}`,
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
        return { success: false, error: errorData.error || "Échec de la suppression de l'image" };
    }

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