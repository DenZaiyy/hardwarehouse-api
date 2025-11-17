import type {Metadata} from "next";
import React from "react";
import {Card, CardContent} from "@/components/ui/card";
import CategoryForm from "@/components/admin/categories/form";

export const metadata: Metadata = {
    title: "HardWareHouse - Administration - Catégories - Ajout",
    description: "Ajouter une nouvelle catégorie dans la liste des catégories",
    robots: {
        index: false,
        follow: false
    }
}

const CategoryAddPage = async () => {
    return (
        <div className="flex flex-col">
            <h1>Ajouter une catégorie</h1>

            <section>
                <Card>
                    <CardContent>
                        <CategoryForm method="POST" />
                    </CardContent>
                </Card>
            </section>
        </div>
    );

}

export default CategoryAddPage;