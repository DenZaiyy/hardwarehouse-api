import {getDiscount} from "@/services/discount.service";
import Link from "next/link";
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {formattedPercentNumber} from "@/lib/discounts/formatted-percent-number";
import {Separator} from "@/components/ui/separator";
import {formatDate} from "@/lib/utils";
import {DiscountType} from "@prisma/client";

interface DiscountParams {
    params: Promise<{ id: string }>;
}

const DiscountDetails = async ({ params }: DiscountParams) => {
    const { id } = await params;
    const discount = await getDiscount(id);
    const product = discount.product ?? null;
    const category = discount.category ?? null;

    return (
        <>
            <h1>Détails de la remise</h1>
            <Card>
                <CardHeader>
                    <CardTitle>
                        Remise: {discount.id}
                    </CardTitle>
                    <CardDescription>
                        Voici les caractéristiques de la remise en détails
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 flex flex-row justify-between gap-2">
                    <div className="flex flex-col gap-2 w-1/4">
                        <p>Type de remise: <strong>{discount.discountType}</strong></p>
                        <p>Remise: <strong>{discount.discountType === DiscountType.PERCENTAGE ? formattedPercentNumber(discount.discountAmount) : discount.discountAmount + ' €'}</strong></p>
                        <p>Débute le: <strong>{new Date(discount.startDate).toLocaleDateString()}</strong></p>
                        <p>Termine le: <strong>{discount.endDate ? new Date(discount.endDate).toLocaleDateString() : 'N/A'}</strong></p>
                    </div>
                    <Separator orientation="vertical" />
                    <div className="flex flex-col gap-2 w-1/4">
                        <p>Catégorie: {category ? <Link href={`/admin/categories/${category.slug}`} className={"underline underline-offset-5"}>{category.name}</Link> : 'N/A'}</p>
                        <p>Produit: {product ? <Link href={`/admin/products/${product.slug}`} className={"underline underline-offset-5"}>{product.name}</Link> : 'N/A'}</p>
                    </div>
                    <Separator orientation="vertical" />
                    <div className="flex flex-col gap-2 w-1/4">
                        <p>Crée le: <strong>{formatDate(discount.createdAt)}</strong></p>
                        <p>Mise à jour le: <strong>{formatDate(discount.updatedAt)}</strong></p>
                    </div>
                </CardContent>
            </Card>
        </>
    )
}

export default DiscountDetails;