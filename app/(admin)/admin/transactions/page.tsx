import type {Metadata} from "next";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import {DataTable} from "@/components/admin/data-table";
import {Suspense} from "react";
import {apiTransactionService} from "@/services/transactionService";
import {columns} from "@/app/(admin)/admin/transactions/column";

export const metadata: Metadata = {
    title: "HardWareHouse - Administration - Transactions de stocks",
    description: "Gérer les transactions de stocks (bon de commande) dans le panneau d'administration HardWareHouse",
    robots: {
        index: false,
        follow: false
    }
}

async function TransactionsTable() {
    const data = await apiTransactionService.getTransactions();
    return <DataTable columns={columns} data={data} inputSearch={false} />;
}

function TransactionsTableSkeleton() {
    return <DataTable columns={columns} data={[]} inputSearch={false} isLoading={true} />;
}

const TransactionsPage = () => {
    return (
        <div className="py-5">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                <h1>Liste des transactions</h1>
                <Button asChild>
                    <Link href="/admin/transactions/add">Effectuer un bon de commande</Link>
                </Button>
            </div>

            <Suspense fallback={<TransactionsTableSkeleton />}>
                <TransactionsTable />
            </Suspense>
        </div>
    )
}

export default TransactionsPage;