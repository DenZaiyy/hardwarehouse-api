import type {Metadata} from "next";
import Form from "@/components/partials/Form";
import React from "react";

export const metadata: Metadata = {
    title: "HardWareHouse - Administration - Catégories - Ajout",
    description: "Ajouter une nouvelle catégorie dans la liste des catégories",
}

const CategoryAddPage = async () => {
    return (
        <div className="flex flex-col">
            <h1>Ajouter une catégorie</h1>

            <section>
                <Form action={`/categories`} method="POST" fileUpload={false}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col">
                            <label htmlFor="name" className="mb-1 font-medium">Nom</label>
                            <input type="text" id="name" name="name" required className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                    </div>
                </Form>
            </section>
        </div>
    );

}

export default CategoryAddPage;