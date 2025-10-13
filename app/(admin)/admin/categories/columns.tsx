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
import {Categories} from "@/app/generated/prisma/client";
import {formatDate} from "@/lib/utils";
import Image from "next/image";
import {DataTableColumnHeader} from "@/components/data-table-column-header";
import {Dialog, DialogContent, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import Link from "next/link";

export const columns: ColumnDef<Categories>[] = [
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
            const image: string = row.getValue('logo');
            const category = row.original
            return (
                <div className="w-20 h-20 relative">
                    {image ? (
                        <Dialog>
                            <DialogTrigger>
                                <Image src={image} alt={`Logo of category : ${category.name}`} fill={true} className="cursor-pointer" />
                            </DialogTrigger>
                            <DialogContent className="w-full">
                                <DialogTitle>{category.name}</DialogTitle>
                                <Image src={image} alt={`Logo of category : ${category.name}`} width={500} height={500} />
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
        header: "Mise à jour le",
        cell: ({ row }) => {
            const updatedAt: string = row.getValue('updatedAt')
            return <div>{formatDate(updatedAt)}</div>
        }
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const category = row.original

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
                            onClick={() => navigator.clipboard.writeText(category.id)}
                        >
                            Copier l&#39;ID de la categorie
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem><Link href={`/admin/categories/${category.id}`}>Voir la catégorie</Link></DropdownMenuItem>
                        <DropdownMenuItem><Link href={`/admin/categories/${category.id}/edit`}>Modifier la catégorie</Link></DropdownMenuItem>
                        <DropdownMenuItem>Supprimer la catégorie</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            )
        }
    }
]