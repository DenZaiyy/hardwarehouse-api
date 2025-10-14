"use client"

import {ColumnDef} from "@tanstack/react-table"
import {DataTableColumnHeader} from "@/components/data-table-column-header";
import Link from "next/link";
import {ProductsWithCategoryAndBrand, StocksWithProduct} from "@/types/types";
import toast from "react-hot-toast";
import {apiStockService} from "@/services/stockService";
import {StockActions} from "@/components/admin/stocks/actions";
import {formatDate} from "@/lib/utils";

async function handleConfirm(stockId: string) {
    await apiStockService.deleteStock(stockId)
    toast.success("Stock supprimée avec succès")
    setTimeout(() => window.location.reload(), 1500)
}

export const columns: ColumnDef<StocksWithProduct>[] = [
    {
        accessorKey: "id",
        header: "ID",
    },
    {
        accessorKey: "product",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Produit" />
        ),
        cell: ({ row }) => {
            const product: ProductsWithCategoryAndBrand = row.getValue('product');

            if (!product) {
                return <div>N/A</div>
            }

            return <div><Link href={`/admin/products/${product.id}`} className="underline underline-offset-5">{product.name}</Link></div>
        }
    },
    {
        accessorKey: "quantity",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Quantity" />
        ),
    },

    {
        accessorKey: "createdAt",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Crée le" />
        ),
        cell: ({ row }) => {
            const createdAt: string = row.getValue('createdAt')
            return <div>{formatDate(createdAt)}</div>
        }
    },
    {
        accessorKey: "updatedAt",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Mise à jour le" />
        ),
        cell: ({ row }) => {
            const updatedAt: string = row.getValue('updatedAt')
            return <div>{formatDate(updatedAt)}</div>
        }
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const stock = row.original

            return (
                <StockActions
                    stockId={stock.id}
                    stockProductName={stock.product.name}
                    onDelete={(id) => handleConfirm(id)}
                />
            )
        }
    }
]