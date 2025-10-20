import {TransactionsWithProduct} from "@/types/types";

export interface TransactionService {
    getTransactions: () => Promise<TransactionsWithProduct[]>;
    getTransaction: (id: string) => Promise<TransactionsWithProduct>;
    createTransaction: (data: Partial<TransactionsWithProduct>) => Promise<TransactionsWithProduct>;
    deleteTransaction: (id: string) => Promise<void>;
}

export const apiTransactionService: TransactionService = {
    getTransactions: async (): Promise<TransactionsWithProduct[]> => {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/transactions`,
            { cache: 'default'}
        );

        if (!res.ok) throw new Error("Failed to fetch transactions");

        return res.json();
    },
    getTransaction: async (id: string): Promise<TransactionsWithProduct> => {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/transactions/${id}`,
            { cache: 'default'}
        );

        if (!res.ok) throw new Error("Failed to fetch transaction");

        return res.json();
    },
    createTransaction: async (data: Partial<TransactionsWithProduct>): Promise<TransactionsWithProduct> => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/transactions`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!res.ok) throw new Error("Failed to create transaction");

        return res.json();
    },
    deleteTransaction: async (id: string): Promise<void> => {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/transactions/${id}`,
            {
                method: "DELETE",
            }
        );

        if (!res.ok) throw new Error("Failed to delete transaction");
    },
};
