import type {Metadata} from "next";
import Table from "@/components/partials/Table";
import {apiCategoryService} from "@/services/categoryService";

export const metadata: Metadata = {
    title: "HardWareHouse - Administration - Categories",
    description: "Manage categories in the HardWareHouse admin panel",
}

export default async function CategoriesPage() {
    const categories = await apiCategoryService.getCategories();

    return (
        <div className="flex flex-col">
            <h1>Categories Management</h1>
            <p className="text-lg text-foreground">Here you can manage your categories.</p>

            <section className="relative mt-8 flex-1">
                <Table data={categories} />
            </section>
        </div>
    )
}