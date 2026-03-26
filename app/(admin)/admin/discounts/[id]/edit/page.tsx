import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {getDiscount} from "@/services/discount.service";
import DiscountForm from "@/components/admin/discounts/form";

interface DiscountParams {
    params: Promise<{ id: string }>;
}

const DiscountEditPage = async ({ params }: DiscountParams) => {
    const { id } = await params;
    const discount = await getDiscount(id);

    if(!discount) {
        return <div>Remise not found</div>;
    }

    return (
        <div className="py-5">
            <h1>Modifier la remise</h1>

            <Card>
                <CardHeader>
                    <CardTitle>ID: {discount.id}</CardTitle>
                </CardHeader>
                <CardContent>
                    <DiscountForm discount={discount} method="PATCH" />
                </CardContent>
            </Card>
        </div>
    );
}

export default DiscountEditPage;