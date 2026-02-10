import {NextRequest, NextResponse} from "next/server";
import {db} from "@/lib/db";
import {slugifyName} from "@/lib/utils";
import {auth} from "@clerk/nextjs/server";

interface UpdateCategoryData {
    name?: string;
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
                slug: true,
                logo: true,
                createdAt: true,
                updatedAt: true,
            }
        });

        if (!category) {
            return NextResponse.json({ error: 'Catégorie introuvable' }, { status: 404 });
        }

        return NextResponse.json(category, {status: 200});
    } catch (error) {
        if (error instanceof Error) {
            console.error('[CATEGORY] ', error.message)
            return NextResponse.json(
                { error: `[CATEGORY] Erreur interne : ${error ? error.message : 'Erreur inconnue'}` },
                { status: 500 }
            );
        }
    }
}

export async function PATCH(_req: NextRequest, ctx: RouteContext<'/api/v1/categories/[slug]'>) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized", statusCode: 401 }, { status: 401 });
        }

        const { slug } = await ctx.params;
        const { name, logo } = await _req.json();

        // Vérifier qu'au moins un champ est fourni
        if (!name && !logo) {
            return NextResponse.json({ error: "Au moins un champ est obligatoire." }, { status: 400 });
        }

        // Construire l'objet de données dynamiquement
        const updateData: UpdateCategoryData = {};
        const category = await db.categories.findUnique({
            where: { slug }
        })

        if (!category) {
            return NextResponse.json({ error: 'Category not found' }, { status: 404 });
        }

        // Mettre à jour le slug seulement si le nom change
        if (name !== category.name) {
            updateData.name = name;
            updateData.slug = slugifyName(name);
        }

        // Mettre à jour le logo seulement s'il change
        if (logo !== category.logo) updateData.logo = logo;

        const updatedCategory = await db.categories.update({
            where: {
                slug: slug
            },
            data: updateData
        });

        return NextResponse.json(updatedCategory, { status: 200 });
    } catch(error) {
        if (error instanceof Error) {
            console.error('[CATEGORY PATCH] ', error.message)
            return NextResponse.json(
                { error: `[CATEGORY PATCH] Erreur interne : ${error ? error.message : 'Erreur inconnue'}` },
                { status: 500 }
            );
        }
    }
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<'/api/v1/categories/[slug]'>) {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json({ error: "Unauthorized", statusCode: 401 }, { status: 401 });
    }

    const { slug } = await ctx.params;

    try {
        const category = await db.categories.findUnique({
            where: {
                slug
            }
        });

        if (!category) {
            return NextResponse.json({ error: 'Catégorie introuvable' }, { status: 404 });
        }

        await db.categories.delete({
            where: {
                slug
            }
        });

        return new NextResponse(`Category with slug ${slug} deleted`, { status: 200 });
    } catch (error) {
        if (error instanceof Error) {
            console.error('[CATEGORY DELETE] ', error.message)
            return NextResponse.json(
                { error: `[CATEGORY DELETE] Erreur interne : ${error ? error.message : 'Erreur inconnue'}` },
                { status: 500 }
            );
        }
    }
}