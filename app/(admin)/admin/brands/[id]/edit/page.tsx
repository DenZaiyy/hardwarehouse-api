import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import BrandForm from "@/components/admin/brands/form";
import {getBrand} from "@/services/brandService";

interface BrandParams {
    params: Promise<{ id: string }>;
}

const BrandEditPage = async ({ params }: BrandParams) => {
    const { id } = await params;
    const brand = await getBrand(id);

    if(!brand) {
        return <div>Brand not found</div>;
    }

    return (
        <div className="py-5">
            <h1>Modifier la marque</h1>

            <Card>
                <CardHeader>
                    <CardTitle>{brand.name}</CardTitle>
                </CardHeader>
                <CardContent>
                    <BrandForm brand={brand} method="PATCH" />
                </CardContent>
            </Card>
        </div>
    );
}

export default BrandEditPage;