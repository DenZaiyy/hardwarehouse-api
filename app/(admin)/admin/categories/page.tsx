import type {Metadata} from "next";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import {DataTable} from "@/components/admin/data-table";
import {columns} from "@/app/(admin)/admin/categories/columns";
import {Suspense} from "react";
import {getCategories} from "@/services/category.service";
import {Categories} from "@prisma/client";

export const metadata: Metadata = {
    title: "HardWareHouse - Administration - Categories",
    description: "Manage categories in the HardWareHouse admin panel",
    robots: {
        index: false,
        follow: false
    }
}

function CategoriesTable({ data }: { data: Categories[] }) {
    return <DataTable columns={columns} data={data} searchHolder="Filtrer les catégories..." />;
}

function CategoriesTableSkeleton() {
    return <DataTable columns={columns} data={[]} searchHolder="Filtrer les catégories..." isLoading={true} />;
}

const CategoriesPage = async () => {
    const result = await getCategories();
    const categoriesCount = result.total;

    return (
        <div className="py-5">
            <div className="flex justify-between items-center">
                <h1>Gestion des catégories ({categoriesCount ?? 0})</h1>
                <Button asChild>
                    <Link href="/admin/categories/add">Ajouter une catégorie</Link>
                </Button>
            </div>

            <Suspense fallback={<CategoriesTableSkeleton />}>
                <CategoriesTable data={result.data} />
            </Suspense>
        </div>
    )
}

export default CategoriesPage;