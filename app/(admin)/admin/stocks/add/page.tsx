import type {Metadata} from "next";
import React from "react";
import {Card, CardContent} from "@/components/ui/card";
import {apiProductService} from "@/services/productService";
import StockForm from "@/components/admin/stocks/form";

export const metadata: Metadata = {
    title: "HardWareHouse - Administration - Products - Add",
    description: "Adding a new product in a products list",
}

const StockAddPage = async () => {
    const products = await apiProductService.getProducts();

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