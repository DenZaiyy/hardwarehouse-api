import type {Metadata} from "next";
import React from "react";
import {Card, CardContent} from "@/components/ui/card";
import DiscountForm from "@/components/admin/discounts/form";
import {getProducts} from "@/services/product.service";
import {getCategories} from "@/services/category.service";

export const metadata: Metadata = {
    title: "HardWareHouse - Administration - Remises - Ajout",
    description: "Ajouter une nouvelle remise",
    robots: {
        index: false,
        follow: false
    }
}

const DiscountAddPage = async () => {
    const products = await getProducts();
    const categories = await getCategories();
    return (
        <div className="flex flex-col">
            <h1>Ajouter une remise</h1>

            <section>
                <Card>
                    <CardContent>
                        <DiscountForm products={products} categories={categories} method="POST" />
                    </CardContent>
                </Card>
            </section>
        </div>
    );

}

export default DiscountAddPage;