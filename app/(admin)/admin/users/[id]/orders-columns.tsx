"use client"

import {ColumnDef} from "@tanstack/react-table"
import {Products} from "@/app/generated/prisma/client";
import {formatDate} from "@/lib/utils";
import {DataTableColumnHeader} from "@/components/data-table-column-header";
import Link from "next/link";
import {PurchaseOrdersWithProduct} from "@/types/types";

export const ordersColumns: ColumnDef<PurchaseOrdersWithProduct>[] = [
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
            const product: Products = row.getValue('product');

            if (!product) {
                return <div>N/A</div>
            }

            return <div><Link href={`/admin/products/${product.id}`} className="underline underline-offset-5">{product.name}</Link></div>
        }
    },
    {
        accessorKey: "quantity",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Quantité" />
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