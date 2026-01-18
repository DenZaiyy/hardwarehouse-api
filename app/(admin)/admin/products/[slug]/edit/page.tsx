import ProductForm from "@/components/admin/products/form";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {getProduct} from "@/services/productService";
import {getCategories} from "@/services/categoryService";
import {getBrands} from "@/services/brandService";

interface ProductParams {
    params: Promise<{ slug: string }>;
}

const ProductEditPage = async ({ params }: ProductParams) => {
    const { slug } = await params;
    const product = await getProduct(slug);
    const brands = await getBrands();
    const categories = await getCategories();

    if(!product) {
        return <div>Product not found</div>;
    }

    return (
        <div className="py-5">
            <h1>Modifier le produit</h1>

            <Card>
                <CardHeader>
                    <CardTitle>{product.name}</CardTitle>
                </CardHeader>
                <CardContent>
                    <ProductForm product={product} brands={brands} categories={categories} method="PATCH" />
                </CardContent>
            </Card>
        </div>
    );
}

export default ProductEditPage;