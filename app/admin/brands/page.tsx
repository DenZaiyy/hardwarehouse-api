import type {Metadata} from "next";

export const metadata: Metadata = {
    title: "HardWareHouse - Administration - Brands",
    description: "Manage brands in the HardWareHouse admin panel",
}

const BrandsPage = async () => {
    // const brands = await apiBrandService.getBrands();

    return (
        <div className="flex flex-col">
            <h1>Brands Management</h1>
            <p className="text-lg text-gray-700">Here you can manage your brands.</p>
            <div className="mt-8 w-full bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-semibold mb-4">Brand List</h2>
                <p className="text-gray-600">This is where the brand management interface will be.</p>
                {/* Add product management functionalities here */}
            </div>
        </div>
    )
}

export default BrandsPage;