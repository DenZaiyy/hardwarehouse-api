import type {Metadata} from "next";
import Link from "next/link";
import {Button} from "@/components/ui/button";
import {apiStockService} from "@/services/stockService";
import {DataTable} from "@/components/admin/data-table";
import {columns} from "@/app/(admin)/admin/stocks/columns";
import {Suspense} from "react";

export const metadata: Metadata = {
    title: "HardWareHouse - Administration - Produits",
    description: "Gérer les produits dans le panneau d'administration HardWareHouse",
}

async function StocksTable() {
    const data = await apiStockService.getStocks();
    return <DataTable columns={columns} data={data} inputSearch={false} />;
}

function StocksTableSkeleton() {
    return <DataTable columns={columns} data={[]} inputSearch={false} isLoading={true} />;
}

const StocksPage = () => {
    return (
        <div className="py-5">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                <h1>Gestion des stocks</h1>
                <Button asChild>
                    <Link href="/admin/stocks/add">Ajouter du stock</Link>
                </Button>
            </div>

            <Suspense fallback={<StocksTableSkeleton />}>
                <StocksTable />
            </Suspense>
        </div>
    )
}

export default StocksPage;