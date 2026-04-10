"use client"

import {ColumnDef} from "@tanstack/react-table"
import {Transactions} from "@prisma/client";
import {formatDate} from "@/lib/utils";
import {DataTableColumnHeader} from "@/components/data-table-column-header";

export const columns: ColumnDef<Transactions>[] = [
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
        accessorKey: "type",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Type de transaction" />
        ),
        cell: ({row}) => {
            const type = row.getValue("type");
            return <div>{type ? "Ajout" : "Retrait"}</div>
        }
    },
    {
        accessorKey: "oldQtt",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Ancien stock" />
        ),
        cell: ({ row }) => {
            const oldQtt: number = row.getValue('oldQtt');

            return <div className="text-red-500 font-medium">{oldQtt}</div>
        }
    },
    {
        accessorKey: "newQtt",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Nouveau stock" />
        ),
        cell: ({ row }) => {
            const newQtt: number = row.getValue('newQtt');

            return <div className="text-green-500 font-medium">{newQtt}</div>
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
]