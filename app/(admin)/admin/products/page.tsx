import ProductClient from "@/components/admin/products/ProductClient";
import type {Metadata} from "next";
import Link from "next/link";

export const metadata: Metadata = {
    title: "HardWareHouse - Administration - Produits",
    description: "Gérer les produits dans le panneau d'administration HardWareHouse",
}

const ProductsPage = () => {
    return (
        <div className="flex flex-col">
            <div className="flex justify-between items-center">
                <h1>Gestion des produits</h1>
                <Link href="/admin/products/add" className={"px-4 py-2 rounded-md cursor-pointer bg-foreground text-background border border-background transition-all duration-200 hover:text-foreground hover:bg-background hover:border-foreground"}>Ajouter un produit</Link>
            </div>

            <ProductClient />
        </div>
    )
}

export default ProductsPage;