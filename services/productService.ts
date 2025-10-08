import {ProductsWithCategoryAndBrand} from "@/types/types";
import toast from "react-hot-toast";


export interface ProductService {
    getProducts: () => Promise<ProductsWithCategoryAndBrand[]>;
    getProduct: (id: string) => Promise<ProductsWithCategoryAndBrand>;
    createProduct: (data: Partial<ProductsWithCategoryAndBrand>) => Promise<ProductsWithCategoryAndBrand>;
    updateProduct: (id: string, data: Partial<ProductsWithCategoryAndBrand>) => Promise<ProductsWithCategoryAndBrand>;
    deleteProduct: (id: string) => Promise<void>;
}

export const apiProductService: ProductService = {
    getProducts: async (): Promise<ProductsWithCategoryAndBrand[]> => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`, { cache: 'default'});

        if (!res.ok) throw new Error("Failed to fetch products");

        return res.json();
    },
    getProduct: async (id: string): Promise<ProductsWithCategoryAndBrand> => {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/products/${id}`,
            { cache: 'force-cache'}
        );

        if (!res.ok) throw new Error("Failed to fetch product");

        return res.json();
    },
    createProduct: async (data: Partial<ProductsWithCategoryAndBrand>): Promise<ProductsWithCategoryAndBrand> => {
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
        data: Partial<ProductsWithCategoryAndBrand>
    ): Promise<ProductsWithCategoryAndBrand> => {
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

        if (!res.ok) {
            toast.error('Failed to delete product');
            throw new Error("Failed to delete product");
        }

        toast.success('Product deleted successfully');
    },
};
