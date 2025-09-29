import {apiProductService} from "@/services/productService";

const ProductDetails = async ({p}: { p: TProduct }) => {
    const product = await apiProductService.getProduct(p.id);

}

export default ProductDetails;