import type {Metadata} from "next";
import Link from "next/link";
import {columns} from "@/app/(admin)/admin/products/columns";
import {Button} from "@/components/ui/button";
import {DataTable} from "@/components/admin/data-table";
import {Suspense} from "react";
import {getProducts} from "@/services/product.service";
import {ProductsWithCategoryAndBrand} from "@/types/types";

export const metadata: Metadata = {
    title: "HardWareHouse - Administration - Produits",
    description: "Gérer les produits dans le panneau d'administration HardWareHouse",
    robots: {
        index: false,
        follow: false
    }
}

function ProductsTable({ data }: { data: ProductsWithCategoryAndBrand[] }) {
    return <DataTable columns={columns} data={data} searchHolder="Filtrer les produits..." />;
}

function ProductsTableSkeleton() {
    return <DataTable columns={columns} data={[]} searchHolder="Filtrer les produits..." isLoading={true} />;
}

const ProductsPage = async () => {
    const result = await getProducts();
    const productsCount = result.total;

    return (
        <div className="py-5">
            <div className="flex justify-between items-center">
                <h1>Gestion des produits ({productsCount ?? 0})</h1>
                <Button asChild>
                    <Link href="/admin/products/add">Ajouter un produit</Link>
                </Button>
            </div>

            <Suspense fallback={<ProductsTableSkeleton />}>
                <ProductsTable data={result.data} />
            </Suspense>
        </div>
    )
}

export default ProductsPage;