import {Brands} from "@/app/generated/prisma/client";
import {BrandFilters} from "@/types/types";

export interface BrandService {
    getBrands: (filters?: BrandFilters) => Promise<Brands[]>;
    getBrand: (id: string) => Promise<Brands>;
    createBrand: (data: Partial<Brands>) => Promise<Brands>;
    updateBrand: (id: string, data: Partial<Brands>) => Promise<Brands>;
    deleteBrand: (id: string) => Promise<void>;
}

export const apiBrandService: BrandService = {
    getBrands: async (filters?: BrandFilters): Promise<Brands[]> => {
        const url = new URL(`${process.env.NEXT_PUBLIC_API_URL}/brands`);

        if (filters) {
            if (filters.page) url.searchParams.append('page', filters.page.toString());
            if (filters.itemsPerPage) url.searchParams.append('itemsPerPage', filters.itemsPerPage.toString());
        }

        const res = await fetch(url.toString());

        if (!res.ok) throw new Error("Failed to fetch brands");

        return res.json();
    },
    getBrand: async (id: string): Promise<Brands> => {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/brands/${id}`
        );

        if (!res.ok) throw new Error("Failed to fetch brand");

        return res.json();
    },
    createBrand: async (data: Partial<Brands>): Promise<Brands> => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/brands`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!res.ok) throw new Error("Failed to create brand");

        return res.json();
    },
    updateBrand: async (
        id: string,
        data: Partial<Brands>
    ): Promise<Brands> => {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/brands/${id}`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            }
        );

        if (!res.ok) throw new Error("Failed to update brand");

        return res.json();
    },
    deleteBrand: async (id: string): Promise<void> => {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/brands/${id}`,
            {
                method: "DELETE",
            }
        );

        if (!res.ok) throw new Error("Failed to delete brand");
    },
};
