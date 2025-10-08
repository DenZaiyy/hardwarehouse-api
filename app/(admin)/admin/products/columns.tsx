"use client"

import {ColumnDef} from "@tanstack/react-table"
import {ProductsWithCategoryAndBrand} from "@/types/types";
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
import {Brands, Categories} from "@/app/generated/prisma/client";
import {formatDate} from "@/lib/utils";
import Image from "next/image";
import {DataTableColumnHeader} from "@/components/data-table-column-header";
import {Dialog, DialogContent, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import Link from "next/link";

export const columns: ColumnDef<ProductsWithCategoryAndBrand>[] = [
    {
        accessorKey: "id",
        header: "ID",
    },
    {
        accessorKey: "name",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Nom" />
        ),
    },
    {
        accessorKey: "image",
        header: "Image",
        cell: ({ row }) => {
            const image: string = row.getValue('image');
            const product = row.original
            return (
                <div className="w-20 h-20 relative">
                    {image ? (
                        <Dialog>
                            <DialogTrigger>
                                <Image src={image} alt="Image of product" fill={true} className="cursor-pointer" />
                            </DialogTrigger>
                            <DialogContent className="w-full">
                                <DialogTitle>{product.name}</DialogTitle>
                                <Image src={image} alt={`Image of product : ${product.name} `} width={500} height={500} />
                            </DialogContent>
                        </Dialog>
                    ) : (
                        <div className="w-20 h-20 bg-gray-200 flex items-center justify-center text-gray-500">
                            No Image
                        </div>
                    )}
                </div>
            )
        }
    },
    {
        accessorKey: "price",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Prix" />
        ),
        cell: ({ row }) => {
            const price = parseFloat(row.getValue('price'));
            const formatted = new Intl.NumberFormat('fr-FR', {
                style: 'currency',
                currency: 'EUR'
            }).format(price);

            return <div className="text-right font-medium">{formatted}</div>
        }
    },
    {
        accessorKey: "brand",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Marque" />
        ),
        cell: ({ row }) => {
            const brand: Brands = row.getValue('brand');
            return <div>{brand ? brand.name : 'N/A'}</div>
        }
    },
    {
        accessorKey: "category",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Catégorie" />
        ),
        cell: ({ row }) => {
            const category: Categories = row.getValue('category');
            return <div>{category ? category.name : 'N/A'}</div>
        }
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
            const product = row.original

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
                            onClick={() => navigator.clipboard.writeText(product.id)}
                        >
                            Copier l&#39;ID du produit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem><Link href={`/admin/products/${product.id}`} >Voir le produit</Link></DropdownMenuItem>
                        <DropdownMenuItem><Link href={`/admin/products/${product.id}/edit`} >Modifier le produit</Link></DropdownMenuItem>
                        <DropdownMenuItem>Supprimer le produit</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    }
]