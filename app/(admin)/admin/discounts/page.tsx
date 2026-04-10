import type {Metadata} from "next";
import {Button} from "@/components/ui/button";
import Link from "next/link";
import {DataTable} from "@/components/admin/data-table";
import {Suspense} from "react";
import {Discounts} from "@prisma/client";
import {getDiscounts} from "@/services/discount.service";
import {columns} from "@/app/(admin)/admin/discounts/columns";

export const metadata: Metadata = {
    title: "HardWareHouse - Administration - Discounts",
    description: "Manage discounts in the HardWareHouse admin panel",
    robots: {
        index: false,
        follow: false
    }
}

function DiscountsTable({ data }: { data: Discounts[] }) {
    return <DataTable columns={columns} data={data} inputSearch={false} />;
}

function DiscountsTableSkeleton() {
    return <DataTable columns={columns} data={[]} inputSearch={false} isLoading={true} />;
}

const DiscountsPage = async () => {
    const result = await getDiscounts();
    const discountsCount = result.total;

    return (
        <div className="py-5">
            <div className="flex justify-between items-center">
                <h1>Gestion des remises ({discountsCount ?? 0})</h1>
                <Button asChild>
                    <Link href="/admin/discounts/add">Ajouter une remise</Link>
                </Button>
            </div>

            <Suspense fallback={<DiscountsTableSkeleton />}>
                <DiscountsTable data={result.data} />
            </Suspense>
        </div>
    )
}

export default DiscountsPage;