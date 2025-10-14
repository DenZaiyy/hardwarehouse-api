import {apiBrandService} from "@/services/brandService";

interface BrandParams {
    params: Promise<{ id: string }>;
}


const BrandDetails = async ({ params }: BrandParams) => {
    const { id } = await params;
    const brand = await apiBrandService.getBrand(id);

    return (
        <>
            <div>
                <h1>Détails de la marque</h1>
                <p>ID: {brand.id}</p>
                <p>Nom: {brand.name}</p>
                <p>Créé le: {new Date(brand.createdAt).toLocaleDateString()}</p>
                <p>Mis à jour le: {new Date(brand.updatedAt).toLocaleDateString()}</p>
            </div>
        </>
    )
}

export default BrandDetails;