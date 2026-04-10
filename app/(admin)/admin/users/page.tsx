import type {Metadata} from "next";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import {DataTable} from "@/components/admin/data-table";
import {Suspense} from "react";
import {columns} from "@/app/(admin)/admin/users/columns";
import {getUsers} from "@/services/user.service";
import {User} from "@clerk/backend";

export const metadata: Metadata = {
    title: "HardWareHouse - Administration - Utilisateurs",
    description: "Gérer les utilisateurs associés à la boutique et le panel d'administration.",
    robots: {
        index: false,
        follow: false
    }
}

async function UsersTable({data}: {data: User[]}) {
    return <DataTable columns={columns} data={data} searchHolder="Filtrer les employés..." searchColumn="username" />;
}

function UsersTableSkeleton() {
    return <DataTable columns={columns} data={[]} searchHolder="Filtrer les employés..." searchColumn="username" isLoading={true} />;
}

const UsersPage = async () => {
    const result = await getUsers();
    return (
        <div className="py-5">
            <div className="flex justify-between items-center">
                <h1>Gestion des utilisateurs ({result.total})</h1>
                <Button asChild>
                    <Link href="/admin/users/add">Ajouter un utilisateur</Link>
                </Button>
            </div>

            <Suspense fallback={<UsersTableSkeleton />}>
                <UsersTable data={result.data} />
            </Suspense>
        </div>
    )
}

export default UsersPage;