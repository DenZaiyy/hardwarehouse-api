import type {Metadata} from "next";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import {DataTable} from "@/components/admin/data-table";
import {columns} from "@/app/(admin)/admin/brands/columns";
import {Suspense} from "react";
import {getBrands} from "@/services/brand.service";
import {Brands} from "@prisma/client";

export const metadata: Metadata = {
    title: "HardWareHouse - Administration - Brands",
    description: "Manage brands in the HardWareHouse admin panel",
    robots: {
        index: false,
        follow: false
    }
}

function BrandsTable({ data }: { data: Brands[] }) {
    return <DataTable columns={columns} data={data} searchHolder="Filtrer les marques..." />;
}

function BrandsTableSkeleton() {
    return <DataTable columns={columns} data={[]} searchHolder="Filtrer les marques..." isLoading={true} />;
}

const BrandsPage = async () => {
    const result = await getBrands();
    const brandsCount = result.total;

    return (
        <div className="py-5">
            <div className="flex justify-between items-center">
                <h1>Gestion des marques ({brandsCount ?? 0})</h1>
                <Button asChild>
                    <Link href="/admin/brands/add">Ajouter une marque</Link>
                </Button>
            </div>

            <Suspense fallback={<BrandsTableSkeleton />}>
                <BrandsTable data={result.data} />
            </Suspense>
        </div>
    )
}

export default BrandsPage;