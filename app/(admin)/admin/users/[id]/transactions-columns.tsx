"use client"

import {ColumnDef} from "@tanstack/react-table"
import {Products} from "@/app/generated/prisma/client";
import {formatDate} from "@/lib/utils";
import {DataTableColumnHeader} from "@/components/data-table-column-header";
import Link from "next/link";
import {TransactionsWithProduct} from "@/types/types";

export const transactionsColumns: ColumnDef<TransactionsWithProduct>[] = [
    {
        accessorKey: "id",
        header: "ID",
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
        accessorKey: "product",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Produit" />
        ),
        cell: ({ row }) => {
            const product: Products = row.getValue('product');

            if (!product) {
                return <div>N/A</div>
            }

            return <div><Link href={`/admin/products/${product.id}`} className="underline underline-offset-5">{product.name}</Link></div>
        }
    },
    {
        accessorKey: "oldQtt",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Ancienne quantité" className="text-red-500" />
        ),
    },
    {
        accessorKey: "newQtt",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Nouvelle quantité" className="text-green-500" />
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
]