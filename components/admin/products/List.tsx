"use client"

import Image from "next/image";
import {useState} from "react";

export default function List({products} : {products: TProduct[]} ) {

    const [results, setResults] = useState<TProduct[]>(products);

    function handleSearch(q: string) {
        const terms = q.toLowerCase().split(/\s+/).filter(Boolean)

        const filteredProducts = products.filter(product => {
            const haystack = [
                product.name?.toLowerCase() || "",
                product.category?.name?.toLowerCase() || "",
                product.Brands?.name?.toLowerCase() || "",
            ].join(" ")

            // all search terms must appear somewhere
            return terms.every(term => haystack.includes(term))
        })

        setResults(filteredProducts)
    }

    return (
        <>
            <div className="mb-4 flex gap-4">
                <input
                    type="text"
                    name="name"
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Rechercher un produit..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <button className="p-4 rounded-md bg-background min-w-max cursor-pointer">Add product</button>
            </div>
            <table>
                <thead>
                <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Slug</th>
                    <th>Image</th>
                    <th>Price</th>
                    <th>Category</th>
                    <th>Brand</th>
                    <th>Created At</th>
                    <th>Updated At</th>
                    <th>Actions</th>
                </tr>
                </thead>
                <tbody>
                {results && results.length > 0 ? (
                    results.map((product) => (
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
                            <td>${product.price}</td>
                            <td>{product.category ? product.category.name : 'Uncategorized'}</td>
                            <td>{product.Brands ? product.Brands.name : 'No Brand'}</td>
                            <td>{product.createdAt}</td>
                            <td>{product.updatedAt}</td>
                            <td>
                                <button className="bg-blue-500 text-foreground hover:underline">Edit</button>
                                <button className="bg-red-500 text-foreground hover:underline">Delete</button>
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
        </>
    )
}