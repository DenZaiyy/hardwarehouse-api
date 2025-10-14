import {Brands} from "@/app/generated/prisma/client";
import toast from "react-hot-toast";

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

        if (!res.ok) toast.error("Échec de la récupération des marques");

        return res.json();
    },
    getBrand: async (id: string): Promise<Brands> => {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/brands/${id}`,
            { cache: 'default'}
        );

        if (!res.ok) toast.error("Échec de récupération de la marque");

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

        if (!res.ok) toast.error("Échec de la création de la marque");

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

        if (!res.ok) toast.error("Échec de la mise à jour de la marque");

        return res.json();
    },
    deleteBrand: async (id: string): Promise<void> => {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/brands/${id}`,
            {
                method: "DELETE",
            }
        );

        if (!res.ok) toast.error("Échec de la suppression de la marque");
    },
};
