import type {Metadata} from "next";
import {apiCategoryService} from "@/services/categoryService";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import {DataTable} from "@/components/admin/data-table";
import {columns} from "@/app/(admin)/admin/categories/columns";
import {Suspense} from "react";

export const metadata: Metadata = {
    title: "HardWareHouse - Administration - Categories",
    description: "Manage categories in the HardWareHouse admin panel",
}

async function CategoriesTable() {
    const data = await apiCategoryService.getCategories();
    return <DataTable columns={columns} data={data} searchHolder="Filtrer les catégories..." />;
}

function CategoriesTableSkeleton() {
    return <DataTable columns={columns} data={[]} searchHolder="Filtrer les catégories..." isLoading={true} />;
}

const CategoriesPage = () => {
    return (
        <div className="py-5">
            <div className="flex justify-between items-center">
                <h1>Gestion des catégories</h1>
                <Button asChild>
                    <Link href="/admin/categories/add">Ajouter une catégorie</Link>
                </Button>
            </div>

            <Suspense fallback={<CategoriesTableSkeleton />}>
                <CategoriesTable />
            </Suspense>
        </div>
    )
}

export default CategoriesPage;