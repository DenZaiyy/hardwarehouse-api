"use client"

import {ColumnDef} from "@tanstack/react-table"
import {Categories, Discounts, DiscountType} from "@prisma/client"
import {formatDate} from "@/lib/utils"
import {DataTableColumnHeader} from "@/components/data-table-column-header"
import toast from "react-hot-toast"
import {deleteDiscount} from "@/services/discount.service";
import {DiscountActions} from "@/components/admin/discounts/actions";
import Link from "next/link";

async function handleConfirm(discountId: string) {
    await deleteDiscount(discountId)
    toast.success("Remise supprimée avec succès")
    setTimeout(() => window.location.reload(), 1500)
}

export const columns: ColumnDef<Discounts>[] = [
    {
        accessorKey: "id",
        header: "ID",
    },
    {
        accessorKey: "category",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Catégorie" />
        ),
        cell: ({ row }) => {
            const category: Categories = row.getValue('category');

            if (!category) {
                return <div>N/A</div>
            }

            return <div><Link href={`/admin/categories/${category.slug}`} className="underline underline-offset-5">{category.name}</Link></div>
        }
    },
    {
        accessorKey: "product",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Produit" />
        ),
        cell: ({ row }) => {
            const product: Categories = row.getValue('product');

            if (!product) {
                return <div>N/A</div>
            }

            return <div><Link href={`/admin/products/${product.slug}`} className="underline underline-offset-5">{product.name}</Link></div>
        }
    },
    {
        accessorKey: "active",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Actif" />
        ),
        cell: ({ row }) => {
            const active = row.getValue('active');

            return <div className={`font-medium ${active ? 'text-green-500' : 'text-red-500'}`}>{active ? "Oui" : "Non"}</div>
        }
    },
    {
        accessorKey: "discountType",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Type de remise" />
        ),
    },
    {
        accessorKey: "discountAmount",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Remise" />
        ),
        cell: ({ row }) => {
            const discount = row.original;
            const amount: number = row.getValue('discountAmount');

            if (discount.discountType === DiscountType.PERCENTAGE) {
                return <div>{amount} %</div>
            }

            return <div>{amount} €</div>
        }
    },
    {
        accessorKey: "startDate",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Débute le" />
        ),
        cell: ({ row }) => {
            const startDate: string = row.getValue("startDate")
            return <div>{formatDate(startDate)}</div>
        },
    },
    {
        accessorKey: "endDate",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Termine le" />
        ),
        cell: ({ row }) => {
            const endDate: string = row.getValue("endDate")

            if (!endDate) {
                return <div>N/A</div>
            }

            return <div>{formatDate(endDate)}</div>
        },
    },
    {
        accessorKey: "createdAt",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Créé le" />
        ),
        cell: ({ row }) => {
            const createdAt: string = row.getValue("createdAt")
            return <div>{formatDate(createdAt)}</div>
        },
    },
    {
        accessorKey: "updatedAt",
        header: "Mise à jour le",
        cell: ({ row }) => {
            const updatedAt: string = row.getValue("updatedAt")
            return <div>{formatDate(updatedAt)}</div>
        },
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const discount = row.original

            return (
                <DiscountActions
                    discountId={discount.id}
                    onDelete={(id) => handleConfirm(id)}
                />
            )
        },
    },
]