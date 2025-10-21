import {apiUserService} from "@/services/userService";
import type {Metadata} from "next";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle} from "@/components/ui/card";
import {Separator} from "@/components/ui/separator";
import {DataTable} from "@/components/admin/data-table";
import {ordersColumns} from "@/app/(admin)/admin/users/[id]/orders-columns";
import {Suspense} from "react";
import {ColumnDef} from "@tanstack/react-table";
import {PurchaseOrdersWithProduct, TransactionsWithProduct} from "@/types/types";
import {transactionsColumns} from "@/app/(admin)/admin/users/[id]/transactions-columns";

export const metadata: Metadata = {
    title: "HardWareHouse - Administration - Utilisateur - Détails",
    description: "Gérer le détails d'un utilisateur et voir les dernières transactions effectuées",
    robots: {
        index: false,
        follow: false
    }
}

interface UserParams {
    params: Promise<{ id: string }>;
}

type TableType = "orders" | "transactions"

type DataMap = {
    orders: PurchaseOrdersWithProduct
    transactions: TransactionsWithProduct
}

async function Table<T extends TableType>({id, type, columns,}: { id: string, type: T, columns: ColumnDef<DataMap[T]>[] }) {
    let data: DataMap[T][]

    switch (type) {
        case "orders":
            data = await apiUserService.getPurchaseOrders(id) as DataMap[T][]
            break
        case "transactions":
            data = await apiUserService.getTransactions(id) as DataMap[T][]
            break
    }

    return (
        <DataTable
            columns={columns}
            data={data}
            searchHolder={
                type === "orders"
                    ? "Filtrer les bons de commandes..."
                    : "Filtrer les transactions..."
            }
            searchColumn="product"
        />
    )
}

function OrdersTableSkeleton() {
    return <DataTable columns={ordersColumns} data={[]} inputSearch={false} isLoading={true} />;
}

const UserDetails = async ({ params }: UserParams) => {
    const { id } = await params;
    const user = await apiUserService.getUser(id);

    return (
        <>
            <h1>Détails de l&#39;utilisateur</h1>
            <Card>
                <CardHeader>
                    <CardTitle>
                        Utilisateur: {user.username}
                    </CardTitle>
                    <CardDescription>
                        Voici les informations concernant l&#39;utilisateur
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 flex flex-row justify-between gap-2">
                    <div className="flex flex-col gap-2">
                        <p>Nom de famille: <strong>{user.lastName}</strong></p>
                        <p>Prénom: <strong>{user.firstName}</strong></p>
                        <p>Email: <strong>{user.emailAddresses[0].emailAddress}</strong></p>
                    </div>
                    <Separator orientation="vertical" />
                    <div className="flex flex-col gap-2">
                        <p>Créé le: <strong>{new Date(user.createdAt).toLocaleDateString('fr', {day: "numeric", hour: "2-digit", minute: "2-digit", year: "numeric", month: "numeric"})}</strong></p>
                        <p>Mis à jour le: <strong>{new Date(user.updatedAt).toLocaleDateString('fr', {day: "numeric", hour: "2-digit", minute: "2-digit", year: "numeric", month: "numeric"})}</strong></p>
                    </div>
                    <Separator orientation="vertical" />
                    <div className="flex flex-col gap-2">
                        <p>Dernière connexion: <strong>{user.lastSignInAt && new Date(user.lastSignInAt).toLocaleDateString('fr', {weekday: "long", day: "2-digit", hour: "2-digit", minute: "2-digit", year: "numeric", month: "short"})}</strong></p>
                        <p>Dernière activité: <strong>{user.lastActiveAt && new Date(user.lastActiveAt).toLocaleDateString('fr', {weekday: "long", day: "2-digit", hour: "2-digit", minute: "2-digit", year: "numeric", month: "short"})}</strong></p>
                    </div>
                </CardContent>
                <CardFooter>
                    <p>ID: {user.id}</p>
                </CardFooter>
            </Card>

            <Tabs defaultValue="orders" className="mt-4">
                <TabsList>
                    <TabsTrigger value="orders">Bon de commandes</TabsTrigger>
                    <TabsTrigger value="transactions">Transactions</TabsTrigger>
                </TabsList>
                <TabsContent value="orders" className="space-y-4">
                    <Suspense fallback={<OrdersTableSkeleton />}>
                        <Table id={user.id} type="orders" columns={ordersColumns} />
                    </Suspense>
                </TabsContent>
                <TabsContent value="transactions">
                    <Suspense fallback={<OrdersTableSkeleton />}>
                        <Table id={user.id} type="transactions" columns={transactionsColumns} />
                    </Suspense>
                </TabsContent>
            </Tabs>
        </>
    )
}

export default UserDetails;