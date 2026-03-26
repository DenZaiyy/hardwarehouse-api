import type {Metadata} from "next";
import React from "react";
import {Card, CardContent} from "@/components/ui/card";
import DiscountForm from "@/components/admin/discounts/form";

export const metadata: Metadata = {
    title: "HardWareHouse - Administration - Remises - Ajout",
    description: "Ajouter une nouvelle remise",
    robots: {
        index: false,
        follow: false
    }
}

const DiscountAddPage = async () => {
    return (
        <div className="flex flex-col">
            <h1>Ajouter une remise</h1>

            <section>
                <Card>
                    <CardContent>
                        <DiscountForm method="POST" />
                    </CardContent>
                </Card>
            </section>
        </div>
    );

}

export default DiscountAddPage;