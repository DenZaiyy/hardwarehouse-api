import {getBrand} from "@/services/brandService";

interface BrandParams {
    params: Promise<{ slug: string }>;
}

const BrandDetails = async ({ params }: BrandParams) => {
    const { slug } = await params;
    const brand = await getBrand(slug);

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