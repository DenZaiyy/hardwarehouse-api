import {Brands} from "@/app/generated/prisma/client";

export interface BrandService {
    getBrands: () => Promise<Brands[]>;
    getBrand: (id: string) => Promise<Brands>;
    createBrand: (data: Partial<Brands>) => Promise<Brands>;
    updateBrand: (id: string, data: Partial<Brands>) => Promise<Brands>;
    deleteBrand: (id: string) => Promise<void>;
}

export const apiBrandService: BrandService = {
    getBrands: async (): Promise<Brands[]> => {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/brands`,
            { cache: 'default'}
        );

        if (!res.ok) throw new Error("Failed to fetch brands");

        return res.json();
    },
    getBrand: async (id: string): Promise<Brands> => {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/brands/${id}`,
            { cache: 'default'}
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
