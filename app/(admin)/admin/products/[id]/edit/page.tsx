import {apiProductService} from "@/services/productService";
import ProductForm from "@/components/admin/products/form";
import {apiBrandService} from "@/services/brandService";
import {apiCategoryService} from "@/services/categoryService";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";

interface ProductParams {
    params: Promise<{ id: string }>;
}

const ProductEditPage = async ({ params }: ProductParams) => {
    const { id } = await params;
    const product = await apiProductService.getProduct(id);
    const brands = await apiBrandService.getBrands();
    const categories = await apiCategoryService.getCategories();

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
                    <ProductForm product={product} brands={brands} categories={categories} />
                </CardContent>
            </Card>
        </div>
    );
}

export default ProductEditPage;