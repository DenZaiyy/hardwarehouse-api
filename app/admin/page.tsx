import type {Metadata} from "next";

export const metadata: Metadata = {
    title: "HardWareHouse - Administration - Dashboard",
    description: "Dashboard for managing products and categories in the HardWareHouse admin panel",
}

export default function DashboardPage() {
    return (
        <>
            <div className="flex flex-col">
                <h1>Admin Dashboard</h1>
                <p className="text-lg text-gray-700">Welcome to the HardWareHouse admin panel.</p>
                <div className="mt-8 w-full bg-white p-6 rounded-lg shadow-md">
                    <h2 className="mix-blend-difference">Manage Products and Categories</h2>
                    <p className="text-gray-600">Use the navigation menu to manage products and categories.</p>
                    {/* Add more admin functionalities here */}
                </div>
            </div>
        </>

    )
}