import ProductClient from "@/components/admin/products/ProductClient";

const ProductsPage = () => {
    return (
        <div className="flex flex-col">
            <h1>Products Management</h1>
            <p className="text-lg text-foreground">Here you can manage your products.</p>

            <ProductClient />
        </div>
    )
}

export default ProductsPage;