import type {Metadata} from "next";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import {DataTable} from "@/components/admin/data-table";
import {Suspense} from "react";
import {apiPurchaseOrdersService} from "@/services/purchaseOrderService";
import {columns} from "@/app/(admin)/admin/purchase-orders/column";

export const metadata: Metadata = {
    title: "HardWareHouse - Administration - Transactions de stocks",
    description: "Gérer les transactions de stocks (bon de commande) dans le panneau d'administration HardWareHouse",
    robots: {
        index: false,
        follow: false
    }
}

async function PurchaseOrdersTable() {
    const data = await apiPurchaseOrdersService.getPurchases();
    return <DataTable columns={columns} data={data} inputSearch={false} />;
}

function PurchaseOrdersTableSkeleton() {
    return <DataTable columns={columns} data={[]} inputSearch={false} isLoading={true} />;
}

const TransactionsPage = () => {
    return (
        <div className="py-5">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                <h1>Liste des bons de commandes</h1>
                <Button asChild>
                    <Link href="/admin/purchase-orders/add">Crée un bon de commande</Link>
                </Button>
            </div>

            <Suspense fallback={<PurchaseOrdersTableSkeleton />}>
                <PurchaseOrdersTable />
            </Suspense>
        </div>
    )
}

export default TransactionsPage;