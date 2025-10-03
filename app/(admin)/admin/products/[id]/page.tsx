import {apiProductService} from "@/services/productService";

interface ProductParams {
    params: Promise<{ id: string }>;
}


const ProductDetails = async ({ params }: ProductParams) => {
    const { id } = await params;
    const product = await apiProductService.getProduct(id);

    return (
        <>
            <div>
                <h1>Product Details</h1>
                <p>ID: {product.id}</p>
                <p>Name: {product.name}</p>
                <p>Price: ${product.price}</p>
                <p>Category: {product.category.name}</p>
                <p>Brand: {product.brand.name}</p>
                <p>Created At: {new Date(product.createdAt).toLocaleDateString()}</p>
                <p>Updated At: {new Date(product.updatedAt).toLocaleDateString()}</p>
            </div>
        </>
    )
}

export default ProductDetails;