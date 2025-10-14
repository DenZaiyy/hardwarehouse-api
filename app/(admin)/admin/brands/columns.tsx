"use client"

import {ColumnDef} from "@tanstack/react-table"
import {Brands} from "@/app/generated/prisma/client"
import {formatDate} from "@/lib/utils"
import Image from "next/image"
import {DataTableColumnHeader} from "@/components/data-table-column-header"
import {Dialog, DialogContent, DialogTitle, DialogTrigger} from "@/components/ui/dialog"
import toast from "react-hot-toast"
import {apiBrandService} from "@/services/brandService"
import {BrandActions} from "@/components/admin/brands/actions";

async function handleConfirm(brandId: string) {
    await apiBrandService.deleteBrand(brandId)
    toast.success("Marque supprimée avec succès")
    setTimeout(() => window.location.reload(), 1500)
}

export const columns: ColumnDef<Brands>[] = [
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
        accessorKey: "logo",
        header: "Logo",
        cell: ({ row }) => {
            const image: string = row.getValue("logo")
            const brand = row.original
            return (
                <div className="w-20 h-20 relative">
                    {image ? (
                        <Dialog>
                            <DialogTrigger>
                                <Image
                                    src={image}
                                    alt={`Logo de la marque : ${brand.name}`}
                                    fill
                                    className="cursor-pointer"
                                />
                            </DialogTrigger>
                            <DialogContent className="w-full">
                                <DialogTitle>{brand.name}</DialogTitle>
                                <Image
                                    src={image}
                                    alt={`Logo de la marque : ${brand.name}`}
                                    width={500}
                                    height={500}
                                />
                            </DialogContent>
                        </Dialog>
                    ) : (
                        <div className="w-20 h-20 bg-gray-200 flex items-center justify-center text-gray-500">
                            No Image
                        </div>
                    )}
                </div>
            )
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
            const brand = row.original

            return (
                <BrandActions
                    brandId={brand.id}
                    brandName={brand.name}
                    onDelete={(id) => handleConfirm(id)}
                />
            )
        },
    },
]