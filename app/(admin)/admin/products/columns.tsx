"use client"

import {ColumnDef} from "@tanstack/react-table"
import {ProductsWithCategoryAndBrand} from "@/types/types";
import {Brands, Categories} from "@/app/generated/prisma/client";
import {formatDate} from "@/lib/utils";
import Image from "next/image";
import {DataTableColumnHeader} from "@/components/data-table-column-header";
import {Dialog, DialogContent, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import toast from "react-hot-toast";
import {ProductActions} from "@/components/admin/products/actions";
import {apiProductService} from "@/services/productService";
import Link from "next/link";

async function handleConfirm(productId: string) {
    await apiProductService.deleteProduct(productId)
    toast.success("Produit supprimée avec succès")
    setTimeout(() => window.location.reload(), 1500)
}

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
            <DataTableColumnHeader column={column} title="Prix HT" />
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

            if (!brand) {
                return <div>N/A</div>
            }

            return <div><Link href={`/admin/brands/${brand.id}`} className="underline underline-offset-5">{brand.name}</Link></div>
        }
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

            return <div><Link href={`/admin/categories/${category.id}`} className="underline underline-offset-5">{category.name}</Link></div>
        }
    },
    {
        accessorKey: "active",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Actif" />
        ),
        cell: ({ row }) => {
            const active = row.getValue('active');

            return <div className="font-medium">{active ? "Oui" : "Non"}</div>
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
                <ProductActions
                    productId={product.id}
                    productName={product.name}
                    onDelete={(id) => handleConfirm(id)}
                />
            )
        }
    }
]