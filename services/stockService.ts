import {StocksWithProduct} from "@/types/types";

export interface StockService {
    getStocks: () => Promise<StocksWithProduct[]>;
    getStock: (id: string) => Promise<StocksWithProduct>;
    createStock: (data: Partial<StocksWithProduct>) => Promise<StocksWithProduct>;
    updateStock: (id: string, data: Partial<StocksWithProduct>) => Promise<StocksWithProduct>;
    deleteStock: (id: string) => Promise<void>;
}

export const apiStockService: StockService = {
    getStocks: async (): Promise<StocksWithProduct[]> => {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/stocks`,
            { cache: 'default'}
        );

        if (!res.ok) throw new Error("Failed to fetch stocks");

        return res.json();
    },
    getStock: async (id: string): Promise<StocksWithProduct> => {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/stocks/${id}`,
            { cache: 'default'}
        );

        if (!res.ok) throw new Error("Failed to fetch stock");

        return res.json();
    },
    createStock: async (data: Partial<StocksWithProduct>): Promise<StocksWithProduct> => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/stocks`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!res.ok) throw new Error("Failed to create stock");

        return res.json();
    },
    updateStock: async (
        id: string,
        data: Partial<StocksWithProduct>
    ): Promise<StocksWithProduct> => {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/stocks/${id}`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            }
        );

        if (!res.ok) throw new Error("Failed to update stock");

        return res.json();
    },
    deleteStock: async (id: string): Promise<void> => {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/stocks/${id}`,
            {
                method: "DELETE",
            }
        );

        if (!res.ok) throw new Error("Failed to delete stock");
    },
};
