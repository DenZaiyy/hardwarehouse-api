"use client"

import {ColumnDef} from "@tanstack/react-table"
import {DataTableColumnHeader} from "@/components/data-table-column-header";
import Link from "next/link";
import {ProductsWithCategoryAndBrand, PurchaseOrdersWithProduct} from "@/types/types";
import toast from "react-hot-toast";
import {formatDate} from "@/lib/utils";
import {apiTransactionService} from "@/services/transactionService";
import {PurchaseOrderActions} from "@/components/admin/purchase-orders/actions";

async function handleConfirm(transactionId: string) {
    await apiTransactionService.deleteTransaction(transactionId)
    toast.success("Transaction supprimée avec succès")
    setTimeout(() => window.location.reload(), 1500)
}

export const columns: ColumnDef<PurchaseOrdersWithProduct>[] = [
    {
        accessorKey: "id",
        header: "ID",
    },
    {
        accessorKey: "product",
        header: ({column}) => (
            <DataTableColumnHeader column={column} title="Produit"/>
        ),
        cell: ({row}) => {
            const product: ProductsWithCategoryAndBrand = row.getValue('product');

            if (!product) {
                return <div>N/A</div>
            }

            return <div><Link href={`/admin/products/${product.id}`}
                              className="underline underline-offset-5">{product.name}</Link></div>
        }
    },
    {
        accessorKey: "quantity",
        header: ({column}) => (
            <DataTableColumnHeader column={column} title="Quantité commander"/>
        ),
    },
    {
        accessorKey: "createdAt",
        header: ({column}) => (
            <DataTableColumnHeader column={column} title="Crée le"/>
        ),
        cell: ({row}) => {
            const createdAt: string = row.getValue('createdAt')
            return <div>{formatDate(createdAt)}</div>
        }
    },
    {
        accessorKey: "userFullName",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Par" />
        ),
    },
    {
        id: "actions",
        cell: ({row}) => {
            const purchaseOrder = row.original

            return (
                <PurchaseOrderActions
                    purchaseOrderId={purchaseOrder.id}
                    onDelete={(id) => handleConfirm(id)}
                />
            )
        }
    }
]