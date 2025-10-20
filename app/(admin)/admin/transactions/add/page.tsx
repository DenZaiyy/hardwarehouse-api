import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import React from "react";
import TransactionForm from "@/components/admin/transactions/form";
import {apiStockService} from "@/services/stockService";

const TransactionAddPage = async () => {
    const stocks = await apiStockService.getStocks();

    return (
        <div className="flex flex-col">
            <h1>Crée une transaction</h1>

            <section>
                <Card>
                    <CardHeader>
                        <CardTitle>Bon de commande</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <TransactionForm stocks={stocks} method="POST" />
                    </CardContent>
                </Card>
            </section>
        </div>
    )
}

export default TransactionAddPage