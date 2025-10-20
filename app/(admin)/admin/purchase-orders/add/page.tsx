import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import React from "react";
import {apiStockService} from "@/services/stockService";
import PurchaseOrderForm from "@/components/admin/purchase-orders/form";

const PurchaseOrderAddPage = async () => {
    const stocks = await apiStockService.getStocks();

    return (
        <div className="flex flex-col">
            <h1>Crée un bon de commande</h1>

            <section>
                <Card>
                    <CardHeader>
                        <CardTitle>Bon de commande</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <PurchaseOrderForm stocks={stocks} method="POST" />
                    </CardContent>
                </Card>
            </section>
        </div>
    )
}

export default PurchaseOrderAddPage