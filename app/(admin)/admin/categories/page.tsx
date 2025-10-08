import type {Metadata} from "next";
import {apiCategoryService} from "@/services/categoryService";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import {DataTable} from "@/components/admin/data-table";
import {columns} from "@/app/(admin)/admin/categories/columns";

export const metadata: Metadata = {
    title: "HardWareHouse - Administration - Categories",
    description: "Manage categories in the HardWareHouse admin panel",
}

export default async function CategoriesPage() {
    const categories = await apiCategoryService.getCategories();

    return (
        <div className="py-5">
            <div className="flex justify-between items-center">
                <h1>Gestion des catégories</h1>
                <Button asChild>
                    <Link href="/admin/categories/add">Ajouter une catégorie</Link>
                </Button>
            </div>

            <DataTable columns={columns} data={categories} searchHolder="Filtrer les catégories..." />
        </div>
    )
}