"use client";

import {Filter} from "@/components/admin/products/Filter";
import {useCallback, useEffect, useState} from "react";
import {Brands, Categories} from "@/app/generated/prisma/client";
import {apiProductService} from "@/services/productService";
import {apiCategoryService} from "@/services/categoryService";
import {apiBrandService} from "@/services/brandService";
import {ProductFilters, ProductsWithCategoryAndBrand} from "@/types/types";
import List from "@/components/admin/products/List";

export default function ProductClient() {
    const [products, setProducts] = useState<ProductsWithCategoryAndBrand[]>([]);
    const [categories, setCategories] = useState<Categories[]>([]);
    const [brands, setBrands] = useState<Brands[]>([]);
    const [filterLoading, setFilterLoading] = useState(false);
    const [initialLoad, setInitialLoad] = useState(true);
    const [openFilter, setOpenFilter] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsData, categoriesData, brandsData] = await Promise.all([
                    apiProductService.getProducts({ itemsPerPage: 5 }),
                    apiCategoryService.getCategories(),
                    apiBrandService.getBrands()
                ]);

                setProducts(productsData);
                setCategories(categoriesData);
                setBrands(brandsData);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setInitialLoad(false);
            }
        };

        fetchData();
    }, []);

    const handleFilterChange = useCallback(async (filters: ProductFilters) => {
        setFilterLoading(true);
        try {
            const filteredProducts = await apiProductService.getProducts(filters);
            setProducts(filteredProducts);
        } catch (error) {
            console.error('Error filtering products:', error);
        } finally {
            setFilterLoading(false);
        }
    }, []);

    return (
        <>
            {initialLoad ? (
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                <section className="relative mt-8 flex-1">
                    <button
                        onClick={() => setOpenFilter(!openFilter)}
                        className="mb-4 p-2 rounded-md bg-background min-w-max cursor-pointer"
                    >
                        {openFilter ? 'Masquer les filtres' : 'Afficher les filtres'}
                    </button>

                    {openFilter && (
                        <Filter
                            categories={categories}
                            brands={brands}
                            onFilterChange={handleFilterChange}
                        />
                    )}

                    {filterLoading && (
                        <div className="absolute inset-0 bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
                            <div className="flex items-center space-x-2">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                                <span className="text-gray-700">Filtering products...</span>
                            </div>
                        </div>
                    )}

                    <div className={`transition-opacity duration-200 ${filterLoading ? "opacity-30" : "opacity-100"}`}>
                        <List products={products} />
                    </div>
                </section>
            )}
        </>
    );
}