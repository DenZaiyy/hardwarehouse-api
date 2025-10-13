import {Categories} from "@/app/generated/prisma/client";

export interface CategoryService {
    getCategories: () => Promise<Categories[]>;
    getCategory: (id: string) => Promise<Categories>;
    createCategory: (data: Partial<Categories>) => Promise<Categories>;
    updateCategory: (id: string, data: Partial<Categories>) => Promise<Categories>;
    deleteCategory: (id: string) => Promise<void>;
}

export const apiCategoryService: CategoryService = {
    getCategories: async (): Promise<Categories[]> => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, { cache: 'default'});

        if (!res.ok) throw new Error("Failed to fetch categories");

        return res.json();
    },
    getCategory: async (id: string): Promise<Categories> => {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/categories/${id}`,
            { cache: 'default'}
        );

        if (!res.ok) throw new Error("Failed to fetch category");

        return res.json();
    },
    createCategory: async (data: Partial<Categories>): Promise<Categories> => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!res.ok) throw new Error("Failed to create category");

        return res.json();
    },
    updateCategory: async (
        id: string,
        data: Partial<Categories>
    ): Promise<Categories> => {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/categories/${id}`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            }
        );

        if (!res.ok) throw new Error("Failed to update category");

        return res.json();
    },
    deleteCategory: async (id: string): Promise<void> => {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/categories/${id}`,
            {
                method: "DELETE",
            }
        );

        if (!res.ok) throw new Error("Failed to delete category");
    },
};
