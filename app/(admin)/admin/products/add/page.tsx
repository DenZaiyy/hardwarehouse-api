import type {Metadata} from "next";
import Form from "@/components/partials/Form";

export const metadata: Metadata = {
    title: "HardWareHouse - Administration - Products - Add",
    description: "Adding a new product in a products list",
}

const ProductAddPage = () => {
    return (
        <div className="flex flex-col">
            <h1>Ajouter un produit</h1>

            <section>
                <Form action={`/api/products/`} method="POST" redirect='/admin/products'>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col">
                            <label htmlFor="name" className="mb-1 font-medium">Nom</label>
                            <input type="text" id="name" name="name" required className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>

                        <div className="flex flex-col">
                            <label htmlFor="slug" className="mb-1 font-medium">Slug</label>
                            <input type="text" id="slug" name="slug" required className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                        </div>
                    </div>
                </Form>
            </section>
        </div>
    );

}

export default ProductAddPage;