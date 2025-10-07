"use client"

import Image from "next/image";
import {useState} from "react";
import {formatDate} from "@/lib/utils";
import ProductDetailModal from "@/components/modal/ProductDetailModal";
import {ProductsWithCategoryAndBrand} from "@/types/types";
import {apiProductService} from "@/services/productService";

type Props = {
    products: ProductsWithCategoryAndBrand[];
}

export default function List({products } : Props) {

    const [selectedProduct, setSelectedProduct] = useState<ProductsWithCategoryAndBrand | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    function handleShowDetails(product: ProductsWithCategoryAndBrand) {
        setSelectedProduct(product);
        setIsModalOpen(true);
    }

    async function handleDeleteProduct(productId: string) {
        await apiProductService.deleteProduct(productId);
    }

    function handleCloseModal() {
        setIsModalOpen(false);
        setSelectedProduct(null);
    }

    return (
        <>
            <table>
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Nom</th>
                    <th>Slug</th>
                    <th>Image</th>
                    <th>Prix</th>
                    <th>Catégorie</th>
                    <th>Marque</th>
                    <th>Crée le</th>
                    <th>Mise à jour le</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {products && products.length > 0 ? (
                    products.map((product) => (
                        <tr key={product.id}>
                            <td>{product.id}</td>
                            <td>{product.name}</td>
                            <td>{product.slug}</td>
                            <td>
                                {product.image ? (
                                    <Image src={product.image} alt={product.name} width={50} height={50}/>
                                ) : (
                                    'No Image'
                                )}
                            </td>
                            <td>{product.price} €</td>
                            <td>{product.category ? product.category.name : 'Uncategorized'}</td>
                            <td>{product.brand ? product.brand.name : 'No Brand'}</td>
                            <td>{formatDate(product.createdAt)}</td>
                            <td>{formatDate(product.updatedAt)}</td>
                            <td className={isModalOpen ? ' is-active' : ''}>
                                <button
                                    onClick={() => handleShowDetails(product)}
                                    className="bg-green-500 text-foreground hover:underline mr-2 p-2 rounded cursor-pointer"
                                >
                                    View
                                </button>
                                <button className="bg-blue-500 text-foreground hover:underline mr-2 p-2 rounded cursor-pointer">Edit</button>
                                <button className="bg-red-500 text-foreground hover:underline p-2 rounded cursor-pointer" onClick={() => handleDeleteProduct(product.id)}>Delete</button>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr>
                        <td colSpan={10}>No products available.</td>
                    </tr>
                )}
                </tbody>
            </table>

            <ProductDetailModal
                title="Product Details"
                product={selectedProduct}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
            />
        </>
    )
}