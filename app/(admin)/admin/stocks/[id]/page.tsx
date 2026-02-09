import Link from "next/link";
import {getStock} from "@/services/stock.service";

interface StockParams {
    params: Promise<{ id: string }>;
}

const StockDetails = async ({ params }: StockParams) => {
    const { id } = await params;
    const stock = await getStock(id);

    return (
        <>
            <div>
                <h1>Stock Details</h1>
                <p>ID: {stock.id}</p>
                <p>Quantity: {stock.quantity}</p>
                <p>Product: <Link href={`/admin/products/${stock.product.id}`}>{stock.product.name}</Link></p>
            </div>
        </>
    )
}

export default StockDetails;