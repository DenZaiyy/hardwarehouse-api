import {NextRequest, NextResponse} from "next/server";
import {db} from "@/lib/db";
import {rateLimiter, slugifyName} from "@/lib/utils";

interface UpdateCategoryData {
    name?: string;
    slug?: string;
    logo?: string;
}

export async function GET(_req: NextRequest, ctx: RouteContext<'/api/categories/[id]'>) {
    const { id } = await ctx.params;
    const ip = _req.headers.get('x-forwarded-for') || _req.headers.get('x-real-ip') || '127.0.0.1';


    try {
        const { success, remaining, reset } = await rateLimiter.limit(ip);

        if (!success) {
            return NextResponse.json(
                { error: "Trop de demandes" },
                { status: 429 }
            );
        }

        const category = await db.categories.findUnique({
            where: {
                id: id
            }
        });

        if (!category) {
            return NextResponse.json({ error: 'Catégorie introuvable' }, { status: 404 });
        }

        const res = NextResponse.json(category, { status: 200 });
        res.headers.set('X-RateLimit-Remaining', remaining.toString());
        res.headers.set('X-RateLimit-Reset', reset.toString());

        return res;
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

export async function PATCH(_req: NextRequest, ctx: RouteContext<'/api/categories/[id]'>) {
    const { id } = await ctx.params;
    const { name, logo } = await _req.json();

    // Vérifier qu'au moins un champ est fourni
    if (!name && !logo) {
        return NextResponse.json({ error: "Au moins un champ est obligatoire." }, { status: 400 });
    }

    try {
        // Construire l'objet de données dynamiquement
        const updateData: UpdateCategoryData = {};
        const category = await db.categories.findUnique({
            where: { id }
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
                id: id
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

export async function DELETE(_req: NextRequest, ctx: RouteContext<'/api/categories/[id]'>) {
    const { id } = await ctx.params;

    try {
        const category = await db.categories.findUnique({
            where: {
                id
            }
        });

        if (!category) {
            return NextResponse.json({ error: 'Catégorie introuvable' }, { status: 404 });
        }

        await db.categories.delete({
            where: {
                id
            }
        });

        return new NextResponse(`Category with id ${id} deleted`, { status: 200 });
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