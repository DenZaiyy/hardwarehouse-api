import {NextRequest, NextResponse} from "next/server";
import {db} from "@/lib/db";
import {slugifyName} from "@/lib/utils";
import {auth} from "@clerk/nextjs/server";

interface UpdateBrandData {
    name?: string;
    slug?: string;
    logo?: string;
}

export async function GET(_req: NextRequest, ctx: RouteContext<'/api/v1/brands/[slug]'>) {
    try {
        const { slug } = await ctx.params;

        const brand = await db.brands.findUnique({
            where: {
                slug
            }
        });

        if (!brand) {
            return NextResponse.json(
                { error: 'Marque introuvable' },
                { status: 404 }
            );
        }

        return NextResponse.json(brand, {status: 200});
    } catch (error) {
        if (error instanceof Error) {
            console.error('[BRAND] ', error.message)
            return NextResponse.json(
                { error: `[BRAND] Erreur interne : ${error ? error.message : 'Erreur inconnue'}` },
                { status: 500 }
            );
        }
    }
}

export async function PATCH(req: NextRequest, ctx: RouteContext<'/api/v1/brands/[slug]'>) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized", statusCode: 401 }, { status: 401 });
        }

        const { slug } = await ctx.params;
        const { name, logo } = await req.json();

        // Vérifier qu'au moins un champ est fourni
        if (!name && !logo) {
            return NextResponse.json({ error: "Au moins un champ est obligatoire." }, { status: 400 });
        }

        // Construire l'objet de données dynamiquement
        const updateData: UpdateBrandData = {};
        const brand = await db.brands.findUnique({
            where: { slug }
        })

        if (!brand) {
            return NextResponse.json({ error: 'Marque introuvable' }, { status: 404 });
        }

        // Mettre à jour le slug seulement si le nom change
        if (name !== brand.name) {
            updateData.name = name;
            updateData.slug = slugifyName(name);
        }

        // Mettre à jour le logo seulement s'il change
        if (logo !== brand.logo) updateData.logo = logo;

        const updatedBrand = await db.brands.update({
            where: {
                slug
            },
            data: updateData
        });

        return NextResponse.json(updatedBrand, { status: 200 });
    } catch(error) {
        if (error instanceof Error) {
            console.error('[BRAND PATCH] ', error.message)
            return NextResponse.json(
                { error: `[BRAND PATCH] Erreur interne : ${error ? error.message : 'Erreur inconnue'}` },
                { status: 500 }
            );
        }
    }
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<'/api/v1/brands/[slug]'>) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized", statusCode: 401 }, { status: 401 });
        }

        const { slug } = await ctx.params;
        const brand = await db.brands.findUnique({
            where: {
                slug
            }
        });

        if (!brand) {
            return NextResponse.json({ error: 'Marque introuvable' }, { status: 404 });
        }

        const brandId = brand.id

        await db.brands.delete({
            where: {
                slug
            }
        });

        return new NextResponse(`Brand with id ${brandId} deleted`, { status: 200 });
    } catch (error) {
        if (error instanceof Error) {
            console.error('[BRAND DELETE] ', error.message)
            return NextResponse.json(
                { error: `[BRAND DELETE] Erreur interne : ${error ? error.message : 'Erreur inconnue'}` },
                { status: 500 }
            );
        }
    }
}