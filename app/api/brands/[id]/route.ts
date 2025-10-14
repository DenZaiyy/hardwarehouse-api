import {NextRequest, NextResponse} from "next/server";
import {db} from "@/lib/db";
import {slugifyName} from "@/lib/utils";

interface UpdateBrandData {
    name?: string;
    slug?: string;
    logo?: string;
}

export async function GET(_req: NextRequest, ctx: RouteContext<'/api/brands/[id]'>) {
    const { id } = await ctx.params;

    try {
        const brand = await db.brands.findUnique({
            where: {
                id: id
            }
        });

        if (!brand) {
            return new NextResponse('Brand not found', { status: 404 });
        }

        return NextResponse.json(brand, { status: 200 });
    } catch (error) {
        console.error('[BRAND] ', error)
        return new NextResponse('Internal Error', { status: 500 });
    }
}

export async function PATCH(_req: NextRequest, ctx: RouteContext<'/api/brands/[id]'>) {
    const { id } = await ctx.params;
    const { name, logo } = await _req.json();

    // Vérifier qu'au moins un champ est fourni
    if (!name && !logo) {
        return new NextResponse("At least one field is required", { status: 400 });
    }

    try {
        // Construire l'objet de données dynamiquement
        const updateData: UpdateBrandData = {};
        const brand = await db.brands.findUnique({
            where: { id }
        })

        if (!brand) {
            return new NextResponse('Brand not found', { status: 404 });
        }

        if (name !== brand.name) {
            updateData.name = name;
            // Générer le slug seulement si le nom change
            updateData.slug = slugifyName(name);
        }

        if (logo !== brand.logo) updateData.logo = logo;

        const updatedBrand = await db.brands.update({
            where: {
                id: id
            },
            data: updateData
        });

        return NextResponse.json(updatedBrand, { status: 200 });
    } catch(error) {
        console.error('[BRAND PATCH] ', error)
        return new NextResponse('Internal Error', { status: 500 });
    }
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<'/api/brands/[id]'>) {
    const { id } = await ctx.params;

    try {
        const brand = await db.brands.findUnique({
            where: {
                id
            }
        });

        if (!brand) {
            return new NextResponse('Brand not found', { status: 404 });
        }

        await db.brands.delete({
            where: {
                id
            }
        });

        return new NextResponse(`Brand with id ${id} deleted`, { status: 200 });
    } catch (error) {
        console.error('[BRAND DELETE] ', error)
        return new NextResponse('Internal Error', { status: 500 });
    }
}