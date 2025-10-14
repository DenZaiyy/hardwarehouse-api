import type {Metadata} from "next";
import React from "react";
import {Card, CardContent} from "@/components/ui/card";
import BrandForm from "@/components/admin/brands/form";

export const metadata: Metadata = {
    title: "HardWareHouse - Administration - Marques - Ajout",
    description: "Ajouter une nouvelle marque dans la liste des marques",
}

const BrandAddPage = async () => {
    return (
        <div className="flex flex-col">
            <h1>Ajouter une marque</h1>

            <section>
                <Card>
                    <CardContent>
                        <BrandForm method="POST" />
                    </CardContent>
                </Card>
            </section>
        </div>
    );

}

export default BrandAddPage;