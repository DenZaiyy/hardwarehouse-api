"use client"

import Image from "next/image";
import {formatDate} from "@/lib/utils";
import {ProductsWithCategoryAndBrand} from "@/types/types";
import Modal from "@/components/partials/Modal";

interface ProductDetailModalProps {
    title: string;
    product: ProductsWithCategoryAndBrand | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function ProductDetailModal({ title, product, isOpen, onClose }: ProductDetailModalProps) {
    if (!isOpen || !product) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="relative overflow-hidden">
                    {product.image ? (
                        <Image
                            src={product.image}
                            alt={product.name}
                            className="w-full h-auto object-cover rounded-lg"
                            fill={true}
                        />
                    ) : (
                        <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-gray-500">No Image</span>
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">ID</label>
                        <p className="text-gray-900">{product.id}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Nom</label>
                        <p className="text-gray-900">{product.name}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Slug</label>
                        <p className="text-gray-900">{product.slug}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Prix</label>
                        <p className="text-gray-900">{product.price} €</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Catégorie</label>
                        <p className="text-gray-900">{product.category ? product.category.name : 'Uncategorized'}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Marque</label>
                        <p className="text-gray-900">{product.brand ? product.brand.name : 'No Brand'}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Crée le</label>
                        <p className="text-gray-900">{formatDate(product.createdAt)}</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Mis à jour le</label>
                        <p className="text-gray-900">{formatDate(product.updatedAt)}</p>
                    </div>
                </div>
            </div>
        </Modal>
    );
}