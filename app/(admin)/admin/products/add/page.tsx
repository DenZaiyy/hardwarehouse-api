

import type {Metadata} from "next";
import Form from "@/components/partials/Form";
import {apiCategoryService} from "@/services/categoryService";
import {apiBrandService} from "@/services/brandService";
import React from "react";

export const metadata: Metadata = {
    title: "HardWareHouse - Administration - Products - Add",
    description: "Adding a new product in a products list",
}

const ProductAddPage = async () => {
    const categories = await apiCategoryService.getCategories();
    const brands = await apiBrandService.getBrands();


    return (
        <div className="flex flex-col">
            <h1>Ajouter un produit</h1>

            <section>
                <Form action={`/products`} method="POST" fileUpload={true} redirect='/admin/products'>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col">
                            <label htmlFor="name" className="mb-1 font-medium">Nom</label>
                            <input type="text" id="name" name="name" required className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>

                        <div className="flex flex-col">
                            <label htmlFor="price" className="mb-1 font-medium">Price</label>
                            <input type="number" id="price" step="0.01" name="price" required className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>

                        <div className="flex flex-col">
                            <label htmlFor="categoryId" className="mb-1 font-medium">Category</label>
                            <select name="categoryId" id="categoryId">
                                <option value="">Select a category</option>
                                {categories.map(category => (
                                    <option key={category.id} value={category.id}>{category.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-col">
                            <label htmlFor="brandId" className="mb-1 font-medium">Brand</label>
                            <select name="brandId" id="brandId">
                                <option value="">Select a brand</option>
                                {brands.map(brand => (
                                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </Form>
            </section>
        </div>
    );

}

export default ProductAddPage;