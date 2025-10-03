import ProductClient from "@/components/admin/products/ProductClient";
import type {Metadata} from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "HardWareHouse - Administration - Products",
    description: "Manage products in the HardWareHouse admin panel",
}

const ProductsPage = () => {
    return (
        <div className="flex flex-col">
            <div className="flex justify-between items-center">
                <h1>Products Management</h1>
                <Link href="/admin/products/add">Ajouter un produit</Link>
            </div>
            <p className="text-lg text-foreground">Here you can manage your products.</p>

            <ProductClient />
        </div>
    )
}

export default ProductsPage;