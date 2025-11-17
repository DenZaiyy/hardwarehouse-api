import {apiCategoryService} from "@/services/categoryService";

interface CategoryParams {
    params: Promise<{ id: string }>;
}

const CategoryDetails = async ({ params }: CategoryParams) => {
    const { id } = await params;
    const category = await apiCategoryService.getCategory(id);

    return (
        <>
            <div>
                <h1>Détails de la catégorie</h1>
                <p>ID: {category.id}</p>
                <p>Nom: {category.name}</p>
                <p>Créé le: {new Date(category.createdAt).toLocaleDateString()}</p>
                <p>Mis à jour le: {new Date(category.updatedAt).toLocaleDateString()}</p>
            </div>
        </>
    )
}

export default CategoryDetails;