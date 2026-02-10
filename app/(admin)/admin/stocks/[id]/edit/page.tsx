import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import StockForm from "@/components/admin/stocks/form";
import {getStock} from "@/services/stock.service";
import {getProducts} from "@/services/product.service";

interface StockParams {
    params: Promise<{ id: string }>;
}

const StockEditPage = async ({ params }: StockParams) => {
    const { id } = await params;
    const stock = await getStock(id);
    const products = await getProducts();

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