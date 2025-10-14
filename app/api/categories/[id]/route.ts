import {NextRequest, NextResponse} from "next/server";
import {db} from "@/lib/db";
import {slugifyName} from "@/lib/utils";

interface UpdateCategoryData {
    name?: string;
    slug?: string;
    logo?: string;
}

export async function GET(_req: NextRequest, ctx: RouteContext<'/api/categories/[id]'>) {
    const { id } = await ctx.params;

    try {
        const category = await db.categories.findUnique({
            where: {
                id: id
            }
        });

        if (!category) {
            return new NextResponse('Category not found', { status: 404 });
        }

        return NextResponse.json(category, { status: 200 });
    } catch (error) {
        console.error('[CATEGORY] ', error)
        return new NextResponse('Internal Error', { status: 500 });
    }
}

export async function PATCH(_req: NextRequest, ctx: RouteContext<'/api/categories/[id]'>) {
    const { id } = await ctx.params;
    const { name, logo } = await _req.json();

    // Vérifier qu'au moins un champ est fourni
    if (!name && !logo) {
        return new NextResponse("At least one field is required", { status: 400 });
    }

    try {
        // Construire l'objet de données dynamiquement
        const updateData: UpdateCategoryData = {};
        const category = await db.categories.findUnique({
            where: { id }
        })

        if (!category) {
            return new NextResponse('Category not found', { status: 404 });
        }

        if (name !== category.name) {
            updateData.name = name;
            // Générer le slug seulement si le nom change
            updateData.slug = slugifyName(name);
        }

        if (logo !== category.logo) updateData.logo = logo;

        const updatedCategory = await db.categories.update({
            where: {
                id: id
            },
            data: updateData
        });

        return NextResponse.json(updatedCategory, { status: 200 });
    } catch(error) {
        console.error('[CATEGORY PATCH] ', error)
        return new NextResponse('Internal Error', { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<'/api/categories/[id]'>) {
    const { id } = await ctx.params;

    try {
        const category = await db.categories.findUnique({
            where: {
                id
            }
        });

        if (!category) {
            return new NextResponse('Category not found', { status: 404 });
        }

        await db.categories.delete({
            where: {
                id
            }
        });

        return new NextResponse(`Category with id ${id} deleted`, { status: 200 });
    } catch (error) {
        console.error('[CATEGORY DELETE] ', error)
        return new NextResponse('Internal Error', { status: 500 });
    }
}