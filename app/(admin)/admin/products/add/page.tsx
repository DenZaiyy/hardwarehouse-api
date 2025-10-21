import type {Metadata} from "next";
import {apiCategoryService} from "@/services/categoryService";
import {apiBrandService} from "@/services/brandService";
import React from "react";
import {Card, CardContent} from "@/components/ui/card";
import ProductForm from "@/components/admin/products/form";

export const metadata: Metadata = {
    title: "HardWareHouse - Administration - Products - Add",
    description: "Adding a new product in a products list",
    robots: {
        index: false,
        follow: false
    }
}

const ProductAddPage = async () => {
    const categories = await apiCategoryService.getCategories();
    const brands = await apiBrandService.getBrands();


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