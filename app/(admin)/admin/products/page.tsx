import type {Metadata} from "next";
import Link from "next/link";
import {columns} from "@/app/(admin)/admin/products/columns";
import {Button} from "@/components/ui/button";
import {DataTable} from "@/components/admin/data-table";
import {Suspense} from "react";
import {getProducts} from "@/services/productService";

export const metadata: Metadata = {
    title: "HardWareHouse - Administration - Produits",
    description: "Gérer les produits dans le panneau d'administration HardWareHouse",
    robots: {
        index: false,
        follow: false
    }
}

async function ProductsTable() {
    const data = await getProducts();
    return <DataTable columns={columns} data={data} searchHolder="Filtrer les produits..." />;
}

function ProductsTableSkeleton() {
    return <DataTable columns={columns} data={[]} searchHolder="Filtrer les produits..." isLoading={true} />;
}

const ProductsPage = () => {
    return (
        <div className="py-5">
            <div className="flex justify-between items-center">
                <h1>Gestion des produits</h1>
                <Button asChild>
                    <Link href="/admin/products/add">Ajouter un produit</Link>
                </Button>
            </div>

            <Suspense fallback={<ProductsTableSkeleton />}>
                <ProductsTable />
            </Suspense>
        </div>
    )
}

export default ProductsPage;