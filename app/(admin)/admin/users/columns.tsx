"use client"

import {ColumnDef} from "@tanstack/react-table"
import {formatDate} from "@/lib/utils"
import {DataTableColumnHeader} from "@/components/data-table-column-header"
import toast from "react-hot-toast"
import {User} from "@clerk/backend";
import UserActions from "@/components/admin/users/actions";
import {deleteUser, updateUser} from "@/services/user.service";

async function handleConfirm(userId: string) {
    await deleteUser(userId)
    toast.success("Utilisateur supprimée avec succès")
    setTimeout(() => window.location.reload(), 1500)
}

async function handleBlock(userId: string, lock: boolean) {
    await updateUser(userId, {
        locked: lock
    })
    toast.success(lock ? "Utilisateur débloqué avec succès" : "Utilisateur bloqué avec succès")
    setTimeout(() => window.location.reload(), 1500)
}

export const columns: ColumnDef<User>[] = [
    {
        accessorKey: "id",
        header: "ID",
    },
    {
        accessorKey: "locked",
        header: "Verrouiller",
        cell: ({ row }) => {
            const user = row.original
            return user.locked ? "Oui" : "Non"
        }
    },
    {
        accessorKey: "username",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Pseudo" />
        )
    },
    {
        accessorKey: "lastName",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Nom" />
        ),
    },
    {
        accessorKey: "firstName",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Prénom" />
        ),
    },
    {
        accessorKey: 'emailAddresses',
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Email" />
        ),
        cell: ({row}) => {
            const user = row.original
            return user.emailAddresses[0].emailAddress
        }
    },
    {
        accessorKey: "publicMetadata",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Rôle" />
        ),
        cell: ({row}) => {
            const user = row.original
            const role = user.publicMetadata["role"]

            return role === "admin" ? "Admin" : "Employé"
        }
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
        accessorKey: "lastActiveAt",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Dernière connexion le" />
        ),
        cell: ({row}) => {
            const lastSignInAt: string = row.getValue("lastActiveAt")
            return <div>{formatDate(lastSignInAt)}</div>
        }
    },
    {
        id: "actions",
        cell: ({ row }) => {
            const user = row.original

            return (
                <UserActions
                    userId={user.id}
                    userFullName={user.fullName ?? ""}
                    onDelete={(id) => handleConfirm(id)}
                    onBlock={(id, lock) => handleBlock(id, lock)}
                    isBlocking={user.locked}
                />
            )
        },
    },
]