import {PurchaseOrdersWithProduct} from "@/types/types";

export interface PurchaseOrderService {
    getPurchases: () => Promise<PurchaseOrdersWithProduct[]>;
    getPurchase: (id: string) => Promise<PurchaseOrdersWithProduct>;
    createPurchase: (data: Partial<PurchaseOrdersWithProduct>) => Promise<PurchaseOrdersWithProduct>;
    deletePurchase: (id: string) => Promise<void>;
}

export const apiPurchaseOrdersService: PurchaseOrderService = {
    getPurchases: async (): Promise<PurchaseOrdersWithProduct[]> => {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/purchase-orders`,
            { cache: 'default'}
        );

        if (!res.ok) throw new Error("Failed to fetch purchase orders");

        return res.json();
    },
    getPurchase: async (id: string): Promise<PurchaseOrdersWithProduct> => {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/purchase-orders/${id}`,
            { cache: 'default'}
        );

        if (!res.ok) throw new Error("Failed to fetch purchase order");

        return res.json();
    },
    createPurchase: async (data: Partial<PurchaseOrdersWithProduct>): Promise<PurchaseOrdersWithProduct> => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/purchase-orders`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!res.ok) throw new Error("Failed to create purchase order");

        return res.json();
    },
    deletePurchase: async (id: string): Promise<void> => {
        const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/purchase-orders/${id}`,
            {
                method: "DELETE",
            }
        );

        if (!res.ok) throw new Error("Failed to delete purchase order");
    },
};
