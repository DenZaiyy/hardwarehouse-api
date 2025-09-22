import type {Metadata} from "next";

export const metadata: Metadata = {
    title: "HardWareHouse - Administration - Categories",
    description: "Manage categories in the HardWareHouse admin panel",
}

export default function CategoriesPage() {
    return (
        <div className="flex flex-col">
            <h1>Categories Management</h1>
            <p className="text-lg text-gray-700">Here you can manage your categories.</p>
            <div className="mt-8 w-full max-w-4xl bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold mb-4">Category List</h2>
                <p className="text-gray-600">This is where the category management interface will be.</p>
            </div>
        </div>
    )
}