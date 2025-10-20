import type {Metadata} from "next";
import {auth, currentUser} from "@clerk/nextjs/server";
import {ChartBarInteractive} from "@/components/admin/chart-stocks";

export const metadata: Metadata = {
    title: "HardWareHouse - Administration - Dashboard",
    description: "Tableau de bord pour la gestion des produits et des catégories dans le panneau d'administration HardWareHouse",
}

export default async function DashboardPage() {
    const { isAuthenticated } = await auth()

    if (!isAuthenticated) {
        return <div>Connectez-vous pour afficher cette page.</div>
    }

    const user = await currentUser()

    return (
        <div className="py-5">
            <div className="flex flex-col">
                <h1>Tableau de bord d&#39;administration</h1>
                <p>Vous êtes actuellement connecté sur <span className="font-bold">{user?.fullName} ({user?.username})</span></p>
            </div>

            <section className="mt-4 w-full">
                <ChartBarInteractive />
            </section>
        </div>

    )
}