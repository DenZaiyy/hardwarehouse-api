"use client"

import {ColumnDef} from "@tanstack/react-table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {Button} from "@/components/ui/button";
import {MoreHorizontal} from "lucide-react";
import {Stocks} from "@/app/generated/prisma/client";
import {DataTableColumnHeader} from "@/components/data-table-column-header";
import Link from "next/link";
import {ProductsWithCategoryAndBrand} from "@/types/types";

export const columns: ColumnDef<Stocks>[] = [
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
        id: "actions",
        cell: ({ row }) => {
            const stock = row.original

            return (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant={"ghost"} className={"h-8 w-8 p-0"}>
                            <span className="sr-only">Ouvrir le menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                            onClick={() => navigator.clipboard.writeText(stock.id)}
                        >
                            Copier l&#39;ID du stock
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem><Link href={`/admin/stocks/${stock.id}`} >Voir le stock</Link></DropdownMenuItem>
                        <DropdownMenuItem><Link href={`/admin/stocks/${stock.id}/edit`} >Modifier le stock</Link></DropdownMenuItem>
                        <DropdownMenuItem>Supprimer le stock</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    }
]