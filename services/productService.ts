import {Products} from "@/app/generated/prisma/client";
import {ProductFilters} from "@/types/types";

export interface ProductService {
    getProducts: (filters?: ProductFilters) => Promise<Products[]>;
    getProduct: (id: string) => Promise<Products>;
    createProduct: (data: Partial<Products>) => Promise<Products>;
    updateProduct: (id: string, data: Partial<Products>) => Promise<Products>;
    deleteProduct: (id: string) => Promise<void>;
}

export const apiProductService: ProductService = {
    getProducts: async (filters?: ProductFilters): Promise<Products[]> => {
        const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/products`);
        
        if (filters) {
            if (filters.name) url.searchParams.append('name', filters.name);
            if (filters.category) url.searchParams.append('category', filters.category);
            if (filters.brand) url.searchParams.append('brand', filters.brand);
            if (filters.minPrice) url.searchParams.append('minPrice', filters.minPrice.toString());
            if (filters.maxPrice) url.searchParams.append('maxPrice', filters.maxPrice.toString());
            if (filters.page) url.searchParams.append('page', filters.page.toString());
            if (filters.itemsPerPage) url.searchParams.append('itemsPerPage', filters.itemsPerPage.toString());
        }

        const res = await fetch(url.toString());

        if (!res.ok) throw new Error("Failed to fetch products");

        return res.json();
    },
    getProduct: async (id: string): Promise<Products> => {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/products/${id}`
        );

        if (!res.ok) throw new Error("Failed to fetch product");

        return res.json();
    },
    createProduct: async (data: Partial<Products>): Promise<Products> => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!res.ok) throw new Error("Failed to create product");

        return res.json();
    },
    updateProduct: async (
        id: string,
        data: Partial<Products>
    ): Promise<Products> => {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/products/${id}`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            }
        );

        if (!res.ok) throw new Error("Failed to update product");

        return res.json();
    },
    deleteProduct: async (id: string): Promise<void> => {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/products/${id}`,
            {
                method: "DELETE",
            }
        );

        if (!res.ok) throw new Error("Failed to delete product");
    },
};
