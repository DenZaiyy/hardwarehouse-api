import {apiProductService} from "@/services/productService";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import Link from "next/link";
import {Separator} from "@/components/ui/separator";
import {formatDate} from "@/lib/utils";
import {BarChartCard} from "@/components/admin/bar-chart-card";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";

interface ProductParams {
    params: Promise<{ id: string }>;
}

const data = [
    { date: "2024-04-01", stocks: 222, mobile: 150 },
    { date: "2024-04-02", stocks: 97, mobile: 180 },
    { date: "2024-04-03", stocks: 167, mobile: 120 },
    { date: "2024-04-04", stocks: 242, mobile: 260 },
    { date: "2024-04-05", stocks: 373, mobile: 290 },
    { date: "2024-04-06", stocks: 301, mobile: 340 },
    { date: "2024-04-07", stocks: 245, mobile: 180 },
    { date: "2024-04-08", stocks: 409, mobile: 320 },
    { date: "2024-04-09", stocks: 59, mobile: 110 },
    { date: "2024-04-10", stocks: 261, mobile: 190 },
    { date: "2024-04-11", stocks: 327, mobile: 350 },
    { date: "2024-04-12", stocks: 292, mobile: 210 },
    { date: "2024-04-13", stocks: 342, mobile: 380 },
    { date: "2024-04-14", stocks: 137, mobile: 220 },
    { date: "2024-04-15", stocks: 120, mobile: 170 },
    { date: "2024-04-16", stocks: 138, mobile: 190 },
    { date: "2024-04-17", stocks: 446, mobile: 360 },
    { date: "2024-04-18", stocks: 364, mobile: 410 },
    { date: "2024-04-19", stocks: 243, mobile: 180 },
    { date: "2024-04-20", stocks: 89, mobile: 150 },
    { date: "2024-04-21", stocks: 137, mobile: 200 },
    { date: "2024-04-22", stocks: 224, mobile: 170 },
    { date: "2024-04-23", stocks: 138, mobile: 230 },
    { date: "2024-04-24", stocks: 387, mobile: 290 },
    { date: "2024-04-25", stocks: 215, mobile: 250 },
    { date: "2024-04-26", stocks: 75, mobile: 130 },
    { date: "2024-04-27", stocks: 383, mobile: 420 },
    { date: "2024-04-28", stocks: 122, mobile: 180 },
    { date: "2024-04-29", stocks: 315, mobile: 240 },
    { date: "2024-04-30", stocks: 454, mobile: 380 },
    { date: "2024-05-01", stocks: 165, mobile: 220 },
    { date: "2024-05-02", stocks: 293, mobile: 310 },
    { date: "2024-05-03", stocks: 247, mobile: 190 },
    { date: "2024-05-04", stocks: 385, mobile: 420 },
    { date: "2024-05-05", stocks: 481, mobile: 390 },
    { date: "2024-05-06", stocks: 498, mobile: 520 },
    { date: "2024-05-07", stocks: 388, mobile: 300 },
    { date: "2024-05-08", stocks: 149, mobile: 210 },
    { date: "2024-05-09", stocks: 227, mobile: 180 },
    { date: "2024-05-10", stocks: 293, mobile: 330 },
    { date: "2024-05-11", stocks: 335, mobile: 270 },
    { date: "2024-05-12", stocks: 197, mobile: 240 },
    { date: "2024-05-13", stocks: 197, mobile: 160 },
    { date: "2024-05-14", stocks: 448, mobile: 490 },
    { date: "2024-05-15", stocks: 473, mobile: 380 },
    { date: "2024-05-16", stocks: 338, mobile: 400 },
    { date: "2024-05-17", stocks: 499, mobile: 420 },
    { date: "2024-05-18", stocks: 315, mobile: 350 },
    { date: "2024-05-19", stocks: 235, mobile: 180 },
    { date: "2024-05-20", stocks: 177, mobile: 230 },
    { date: "2024-05-21", stocks: 82, mobile: 140 },
    { date: "2024-05-22", stocks: 81, mobile: 120 },
    { date: "2024-05-23", stocks: 252, mobile: 290 },
    { date: "2024-05-24", stocks: 294, mobile: 220 },
    { date: "2024-05-25", stocks: 201, mobile: 250 },
    { date: "2024-05-26", stocks: 213, mobile: 170 },
    { date: "2024-05-27", stocks: 420, mobile: 460 },
    { date: "2024-05-28", stocks: 233, mobile: 190 },
    { date: "2024-05-29", stocks: 78, mobile: 130 },
    { date: "2024-05-30", stocks: 340, mobile: 280 },
    { date: "2024-05-31", stocks: 178, mobile: 230 },
    { date: "2024-06-01", stocks: 178, mobile: 200 },
    { date: "2024-06-02", stocks: 470, mobile: 410 },
    { date: "2024-06-03", stocks: 103, mobile: 160 },
    { date: "2024-06-04", stocks: 439, mobile: 380 },
    { date: "2024-06-05", stocks: 88, mobile: 140 },
    { date: "2024-06-06", stocks: 294, mobile: 250 },
    { date: "2024-06-07", stocks: 323, mobile: 370 },
    { date: "2024-06-08", stocks: 385, mobile: 320 },
    { date: "2024-06-09", stocks: 438, mobile: 480 },
    { date: "2024-06-10", stocks: 155, mobile: 200 },
    { date: "2024-06-11", stocks: 92, mobile: 150 },
    { date: "2024-06-12", stocks: 492, mobile: 420 },
    { date: "2024-06-13", stocks: 81, mobile: 130 },
    { date: "2024-06-14", stocks: 426, mobile: 380 },
    { date: "2024-06-15", stocks: 307, mobile: 350 },
    { date: "2024-06-16", stocks: 371, mobile: 310 },
    { date: "2024-06-17", stocks: 475, mobile: 520 },
    { date: "2024-06-18", stocks: 107, mobile: 170 },
    { date: "2024-06-19", stocks: 341, mobile: 290 },
    { date: "2024-06-20", stocks: 408, mobile: 450 },
    { date: "2024-06-21", stocks: 169, mobile: 210 },
    { date: "2024-06-22", stocks: 317, mobile: 270 },
    { date: "2024-06-23", stocks: 480, mobile: 530 },
    { date: "2024-06-24", stocks: 132, mobile: 180 },
    { date: "2024-06-25", stocks: 141, mobile: 190 },
    { date: "2024-06-26", stocks: 434, mobile: 380 },
    { date: "2024-06-27", stocks: 448, mobile: 490 },
    { date: "2024-06-28", stocks: 149, mobile: 200 },
    { date: "2024-06-29", stocks: 103, mobile: 160 },
    { date: "2024-06-30", stocks: 446, mobile: 400 },
]


const config = {
    stocks: { label: "Stocks", color: "var(--chart-2)" },
    mobile: { label: "Mobile", color: "var(--chart-1)" },
} as const

const ProductDetails = async ({ params }: ProductParams) => {
    const { id } = await params;
    const product = await apiProductService.getProduct(id);

    return (
        <>
            <h1>Détails du produit</h1>
            <Card>
                <CardHeader>
                    <CardTitle>
                        Produit: {product.name}
                    </CardTitle>
                    <CardDescription>
                        Voici les caractéristiques du produit en détails
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 flex flex-row justify-between gap-2">
                    <div className="flex flex-col gap-2">
                        <p>Nom: <strong>{product.name}</strong></p>
                        <p>Prix HT: <strong>{product.price}</strong></p>
                        <p>TVA: <strong>20%</strong></p>
                        <p>Prix TTC: <strong>{Number((product.price * 1.2)).toFixed(2)}</strong></p>
                    </div>
                    <Separator orientation="vertical" />
                    <div className="flex flex-col gap-2">
                        <p>Catégorie: <strong><Link href={`/admin/categories/${product.category.id}`}>{product.category.name}</Link></strong></p>
                        <p>Marque: <strong><Link href={`/admin/brands/${product.brand.id}`}>{product.brand.name}</Link></strong></p>
                    </div>
                    <Separator orientation="vertical" />
                    <div className="flex flex-col gap-2">
                        <p>Crée le: <strong>{formatDate(product.createdAt)}</strong></p>
                        <p>Mise à jour le: <strong>{formatDate(product.updatedAt)}</strong></p>
                    </div>
                </CardContent>
                <CardFooter>
                    <p>ID: {product.id}</p>
                </CardFooter>
            </Card>

            <Tabs defaultValue="statistics" className="mt-4">
                <TabsList>
                    <TabsTrigger value="statistics">Statistiques</TabsTrigger>
                    <TabsTrigger value="transactions">Transactions</TabsTrigger>
                </TabsList>
                <TabsContent value="statistics" className="space-y-4">
                    <BarChartCard title="Evolution du stock" description="Showing total visitors for the last 3 months" data={data} config={config} defaultKey="stocks" />
                    <BarChartCard title="Evolution du stock" description="" data={data} config={config} defaultKey="stocks" />
                </TabsContent>
                <TabsContent value="transactions">Change your password here.</TabsContent>
            </Tabs>
        </>
    )
}

export default ProductDetails;