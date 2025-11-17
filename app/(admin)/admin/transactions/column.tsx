"use client"

import {ColumnDef} from "@tanstack/react-table"
import {DataTableColumnHeader} from "@/components/data-table-column-header";
import Link from "next/link";
import {ProductsWithCategoryAndBrand, TransactionsWithProduct} from "@/types/types";
import toast from "react-hot-toast";
import {formatDate} from "@/lib/utils";
import {apiTransactionService} from "@/services/transactionService";
import {TransactionActions} from "@/components/admin/transactions/actions";

async function handleConfirm(transactionId: string) {
    await apiTransactionService.deleteTransaction(transactionId)
    toast.success("Transaction supprimée avec succès")
    setTimeout(() => window.location.reload(), 1500)
}

export const columns: ColumnDef<TransactionsWithProduct>[] = [
    {
        accessorKey: "id",
        header: "ID",
    },
    {
        accessorKey: "userFullName",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Employé" />
        ),
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
        accessorKey: "oldQtt",
        header: ({column}) => (
            <DataTableColumnHeader column={column} title="Ancienne quantité"/>
        ),
    },
    {
        accessorKey: "newQtt",
        header: ({column}) => (
            <DataTableColumnHeader column={column} title="Nouvelle quantité"/>
        ),
    },
    {
        accessorKey: "type",
        header: ({column}) => (
            <DataTableColumnHeader column={column} title="Type de transaction"/>
        ),
        cell: ({row}) => {
            const type = row.getValue("type");
            return <div>{type ? "Ajout" : "Retrait"}</div>
        }
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
        id: "actions",
        cell: ({row}) => {
            const transaction = row.original

            return (
                <TransactionActions
                    transactionId={transaction.id}
                    onDelete={(id) => handleConfirm(id)}
                />
            )
        }
    }
]