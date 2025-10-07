import type {Metadata} from "next";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import {DataTable} from "@/components/admin/data-table";
import {columns} from "@/app/(admin)/admin/brands/columns";
import {apiBrandService} from "@/services/brandService";

export const metadata: Metadata = {
    title: "HardWareHouse - Administration - Brands",
    description: "Manage brands in the HardWareHouse admin panel",
}

const BrandsPage = async () => {
    const brands = await apiBrandService.getBrands();

    return (
        <div className="py-5">
            <div className="flex justify-between items-center">
                <h1>Gestion des marques</h1>
                <Button asChild>
                    <Link href="/admin/brands/add">Ajouter une marque</Link>
                </Button>
            </div>
            <DataTable columns={columns} data={brands} searchHolder="Filtrer les marques..." />
        </div>
    )
}

export default BrandsPage;