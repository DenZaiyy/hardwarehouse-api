"use client"

import {useEffect, useState} from "react";
import {Brands, Categories} from "@/app/generated/prisma/client";
import {ProductFilters} from "@/types/types";

interface FilterProps {
    categories: Categories[];
    brands: Brands[];
    onFilterChange: (filters: ProductFilters) => void;
    initialFilters?: ProductFilters;
}

export function Filter({categories, brands, onFilterChange, initialFilters}: FilterProps) {
    const [filters, setFilters] = useState<ProductFilters>({
        name: "",
        category: "",
        brand: "",
        minPrice: undefined,
        maxPrice: undefined,
        page: 1,
        itemsPerPage: 10,
        ...initialFilters
    });

    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        if (!isInitialized) {
            setIsInitialized(true);
            return;
        }

        const debounceTimer = setTimeout(() => {
            const updatedFilters = {
                ...filters,
                category: selectedCategories.length > 0 ? selectedCategories.join(",") : undefined,
                brand: selectedBrands.length > 0 ? selectedBrands.join(",") : undefined,
            };
            onFilterChange(updatedFilters);
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [filters, selectedCategories, selectedBrands, onFilterChange, isInitialized]);

    const handleInputChange = (key: keyof ProductFilters, value: string | number | undefined) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-expect-error
        setFilters(prev => ({
            ...prev,
            [key]: value,
            page: key !== 'page' ? 1 : value
        }));
    };

    const handleCategoryChange = (categoryId: string, checked: boolean) => {
        setSelectedCategories(prev => {
            if (checked) {
                return [...prev, categoryId];
            } else {
                return prev.filter(id => id !== categoryId);
            }
        });
        setFilters(prev => ({...prev, page: 1}));
    };

    const handleBrandChange = (brandId: string, checked: boolean) => {
        setSelectedBrands(prev => {
            if (checked) {
                return [...prev, brandId];
            } else {
                return prev.filter(id => id !== brandId);
            }
        });
        setFilters(prev => ({...prev, page: 1}));
    };

    const clearFilters = () => {
        setFilters({
            name: "",
            category: "",
            brand: "",
            minPrice: undefined,
            maxPrice: undefined,
            page: 1,
            itemsPerPage: 10
        });
        setSelectedCategories([]);
        setSelectedBrands([]);
    };

    return (
        <div className="flex flex-col p-6 rounded-lg shadow-sm border">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Filters</h3>
                <button
                    onClick={clearFilters}
                    className="text-sm text-foreground/50 hover:text-foreground/70 underline"
                >
                    Tout effacer
                </button>
            </div>

            <div className="flex flex-col gap-6">
                {/* Search by name */}
                <div className="flex-1">
                    <label className="block text-sm font-medium text-foreground/70 mb-2">
                        Nom du produit
                    </label>
                    <input
                        type="text"
                        value={filters.name || ""}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="Search products..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Price range */}
                <div className="flex-1">
                    <label className="block text-sm font-medium text-foreground/70 mb-2">
                        Ranger de prix (€)
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="number"
                            value={filters.minPrice || ""}
                            onChange={(e) => handleInputChange('minPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                            placeholder="Min"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                            type="number"
                            value={filters.maxPrice || ""}
                            onChange={(e) => handleInputChange('maxPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                            placeholder="Max"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Categories */}
                <div className="flex-1">
                    <label className="block text-sm font-medium text-foreground/70 mb-2">
                        Catégories
                    </label>
                    <div className="max-h-32 overflow-y-auto space-y-2">
                        {categories.map((category) => (
                            <label key={category.id} className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={selectedCategories.includes(category.id)}
                                    onChange={(e) => handleCategoryChange(category.id, e.target.checked)}
                                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="text-sm text-foreground/70">{category.name}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Brands */}
                <div className="flex-1">
                    <label className="block text-sm font-medium text-foreground/70 mb-2">
                        Marques
                    </label>
                    <div className="max-h-32 overflow-y-auto space-y-2">
                        {brands.map((brand) => (
                            <label key={brand.id} className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={selectedBrands.includes(brand.id)}
                                    onChange={(e) => handleBrandChange(brand.id, e.target.checked)}
                                    className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <span className="text-sm text-foreground/70">{brand.name}</span>
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            {/* Pagination controls */}
            <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <label className="text-sm font-medium text-foreground/70">
                            Elements par page:
                        </label>
                        <select
                            value={filters.itemsPerPage}
                            onChange={(e) => handleInputChange('itemsPerPage', parseInt(e.target.value))}
                            className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => handleInputChange('page', Math.max(1, (filters.page || 1) - 1))}
                            disabled={filters.page === 1}
                            className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                            Précédent
                        </button>
                        <span className="text-sm text-foreground/70">
                            Page {filters.page || 1}
                        </span>
                        <button
                            onClick={() => handleInputChange('page', (filters.page || 1) + 1)}
                            className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                        >
                            Suivant
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}