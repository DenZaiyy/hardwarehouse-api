"use client"

import Image from "next/image";
import {Products} from "@/app/generated/prisma/client";
import {formatDate} from "@/lib/utils";
import {useEffect} from "react";

interface ProductDetailModalProps {
    title?: string;
    product: Products | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function ProductDetailModal({ title, product, isOpen, onClose }: ProductDetailModalProps) {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        }

        const handleClickOutside = (e: MouseEvent) => {
            if ((e.target as HTMLElement).id === 'detail-product') {
                onClose();
            }
        }

        document.addEventListener('click', handleClickOutside);
        document.addEventListener('keydown', handleEscape);

        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
            document.removeEventListener('keydown', handleEscape);
            document.removeEventListener('click', handleClickOutside);
        };
    }, [isOpen, onClose]);

    if (!isOpen || !product) return null;

    return (
        <div id="detail-product" className="fixed inset-0 bg-black/80 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                        ×
                    </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        {product.image ? (
                            <Image
                                src={product.image}
                                alt={product.name}
                                width={300}
                                height={300}
                                className="w-full h-auto rounded-lg"
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
            </div>
        </div>
    );
}