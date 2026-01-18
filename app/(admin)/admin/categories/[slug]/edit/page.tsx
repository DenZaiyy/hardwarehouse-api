import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import CategoryForm from "@/components/admin/categories/form";
import {getCategory} from "@/services/categoryService";

interface CategoryParams {
    params: Promise<{ slug: string }>;
}

const CategoryEditPage = async ({ params }: CategoryParams) => {
    const { slug } = await params;
    const category = await getCategory(slug);

    if(!category) {
        return <div>Category not found</div>;
    }

    return (
        <div className="py-5">
            <h1>Modifier la catégorie</h1>

            <Card>
                <CardHeader>
                    <CardTitle>{category.name}</CardTitle>
                </CardHeader>
                <CardContent>
                    <CategoryForm category={category} method="PATCH" />
                </CardContent>
            </Card>
        </div>
    );
}

export default CategoryEditPage;