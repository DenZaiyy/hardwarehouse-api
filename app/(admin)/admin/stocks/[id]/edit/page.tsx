import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {apiStockService} from "@/services/stockService";
import StockForm from "@/components/admin/stocks/form";
import {apiProductService} from "@/services/productService";

interface StockParams {
    params: Promise<{ id: string }>;
}

const StockEditPage = async ({ params }: StockParams) => {
    const { id } = await params;
    const stock = await apiStockService.getStock(id);
    const products = await apiProductService.getProducts();

    if(!stock) {
        return <div>Stock not found</div>;
    }

    return (
        <div className="py-5">
            <h1>Modifier le stock</h1>

            <Card>
                <CardHeader>
                    <CardTitle>{stock.product.name} ({stock.quantity})</CardTitle>
                </CardHeader>
                <CardContent>
                    <StockForm stock={stock} products={products}  method="PATCH" />
                </CardContent>
            </Card>
        </div>
    );
}

export default StockEditPage;