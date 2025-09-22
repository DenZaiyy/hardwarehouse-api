import type {Metadata} from "next";
import {apiProductService} from "@/services/productService";
import List from "@/components/admin/products/List";

export const metadata: Metadata = {
    title: "HardWareHouse - Administration - Products",
    description: "Manage products in the HardWareHouse admin panel",
}

const ProductsPage = async () => {
    const products = await apiProductService.getProducts();

    return (
        <div className="flex flex-col">
            <h1>Products Management</h1>
            <p className="text-lg text-foreground">Here you can manage your products.</p>
            <section className="mt-5">
                <List products={products} />
                {/*<table>
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
                        {products && products.length > 0 ? (
                        products.map((product) => (
                        <tr key={product.id}>
                            <td>{product.id}</td>
                            <td>{product.name}</td>
                            <td>{product.slug}</td>
                            <td>
                                {product.image ? (
                                    <Image src={product.image} alt={product.name} width={50} height={50} />
                                ) : (
                                    'No Image'
                                )}
                            </td>
                            <td>${product.price}</td>
                            <td>{product.category ? product.category.name : 'Uncategorized'}</td>
                            <td>{product.brand ? product.brand.name : 'No Brand'}</td>
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
                </table>*/}
            </section>
        </div>
    )
}

export default ProductsPage;