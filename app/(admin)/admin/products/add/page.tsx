import type {Metadata} from "next";
import React from "react";
import {Card, CardContent} from "@/components/ui/card";
import ProductForm from "@/components/admin/products/form";
import {getCategories} from "@/services/categoryService";
import {getBrands} from "@/services/brandService";

export const metadata: Metadata = {
    title: "HardWareHouse - Administration - Products - Add",
    description: "Adding a new product in a products list",
    robots: {
        index: false,
        follow: false
    }
}

const ProductAddPage = async () => {
    const categories = await getCategories();
    const brands = await getBrands();


    return (
        <div className="flex flex-col">
            <h1>Ajouter un produit</h1>

            <section>
                <Card>
                    <CardContent>
                        <ProductForm brands={brands} categories={categories}  method="POST" />
                    </CardContent>
                </Card>
            </section>
        </div>
    );

}

export default ProductAddPage;