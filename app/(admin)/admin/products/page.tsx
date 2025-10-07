import type {Metadata} from "next";
import Link from "next/link";
import {apiProductService} from "@/services/productService";
import {columns} from "@/app/(admin)/admin/products/columns";
import {Button} from "@/components/ui/button";
import {DataTable} from "@/components/admin/data-table";

export const metadata: Metadata = {
    title: "HardWareHouse - Administration - Produits",
    description: "Gérer les produits dans le panneau d'administration HardWareHouse",
}


const ProductsPage = async () => {
    const data = await apiProductService.getProducts();

    return (
        <div className="py-5">
            <div className="flex justify-between items-center">
                <h1>Gestion des produits</h1>
                <Button asChild>
                    <Link href="/admin/products/add">Ajouter un produit</Link>
                </Button>
            </div>

            <DataTable columns={columns} data={data} searchHolder="Filtrer les produits..." />
        </div>
    )
}

export default ProductsPage;