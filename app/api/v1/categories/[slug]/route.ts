import {NextRequest, NextResponse} from "next/server";
import {db} from "@/lib/db";
import {slugifyName} from "@/lib/utils";
import {auth} from "@clerk/nextjs/server";
import {requireAdmin} from "@/lib/auth/require-role";
import {handleApiError} from "@/lib/api/handle-api-error";
import {NotFoundError} from "@/lib/api/errors";
import {categoryPatchSchema} from "@/lib/validators/categorySchema";

interface UpdateCategoryData {
    name?: string;
    active?: boolean;
    slug?: string;
    logo?: string;
}

export async function GET(_req: NextRequest, ctx: RouteContext<'/api/v1/categories/[slug]'>) {
    const { slug } = await ctx.params;

    try {
        const category = await db.categories.findUnique({
            where: {
                slug: slug
            },
            select: {
                id: true,
                name: true,
                active: true,
                slug: true,
                logo: true,
                createdAt: true,
                updatedAt: true,
            }
        });

        if (!category) throw new NotFoundError("Catégorie");

        return NextResponse.json(category, {status: 200});
    } catch (error) {
        return handleApiError("CATEGORY GET", error);
    }
}

export async function PATCH(req: NextRequest, ctx: RouteContext<'/api/v1/categories/[slug]'>) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized", statusCode: 401 }, { status: 401 });
        }

        const { slug } = await ctx.params;
        const body = await req.json();
        const { name, logo, active } = categoryPatchSchema.parse(body);

        // Vérifier qu'au moins un champ est fourni
        if (name === undefined && logo === undefined && active === undefined) {
            return NextResponse.json({ error: "Au moins un champ est obligatoire." }, { status: 400 });
        }

        // Construire l'objet de données dynamiquement
        const updateData: UpdateCategoryData = {};
        const category = await db.categories.findUnique({
            where: { slug }
        })

        if (!category) throw new NotFoundError("Catégorie");

        // Mettre à jour le slug seulement si le nom change
        if (name !== undefined && name !== category.name) {
            updateData.name = name;
            updateData.slug = slugifyName(name);
        }

        // Mettre à jour le logo seulement s'il change
        if (logo !== undefined && logo !== category.logo) {
            updateData.logo = logo;
        }

        // Mettre à jour active seulement s'il change
        if (active !== undefined && active !== category.active) {
            updateData.active = Boolean(active);
        }

        const updatedCategory = await db.categories.update({
            where: {
                slug: slug
            },
            data: updateData
        });

        return NextResponse.json(updatedCategory, { status: 200 });
    } catch(error) {
        return handleApiError("CATEGORY PATCH", error);
    }
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<'/api/v1/categories/[slug]'>) {
    const { response } = await requireAdmin();
    if (response) return response;

    const { slug } = await ctx.params;

    try {
        const category = await db.categories.findUnique({
            where: {
                slug
            }
        });

        if (!category) throw new NotFoundError("Catégorie");

        await db.categories.delete({
            where: {
                slug
            }
        });

        return new NextResponse(`Category with slug ${slug} deleted`, { status: 200 });
    } catch (error) {
        return handleApiError("CATEGORY DELETE", error);
    }
}