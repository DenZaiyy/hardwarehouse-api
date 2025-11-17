import type {Metadata} from "next";
import React from "react";
import {Card, CardContent} from "@/components/ui/card";
import StockForm from "@/components/admin/stocks/form";
import {getProducts} from "@/services/productService";

export const metadata: Metadata = {
    title: "HardWareHouse - Administration - Products - Add",
    description: "Adding a new product in a products list",
    robots: {
        index: false,
        follow: false
    }
}

const StockAddPage = async () => {
    const products = await getProducts();

    return (
        <div className="flex flex-col">
            <h1>Ajouter un stock</h1>

            <section>
                <Card>
                    <CardContent>
                        <StockForm products={products} method="POST" />
                    </CardContent>
                </Card>
            </section>
        </div>
    );

}

export default StockAddPage;