import {NextRequest, NextResponse} from "next/server";
import {db} from "@/lib/db";
import {slugifyName} from "@/lib/utils";
import {auth} from "@clerk/nextjs/server";
import {requireAdmin} from "@/lib/auth/require-role";
import {handleApiError} from "@/lib/api/handle-api-error";
import {NotFoundError} from "@/lib/api/errors";
import {brandPatchSchema} from "@/lib/validators/brandSchema";

interface UpdateBrandData {
    name?: string;
    slug?: string;
    logo?: string;
    active?: boolean;
}

export async function GET(_req: NextRequest, ctx: RouteContext<'/api/v1/brands/[slug]'>) {
    try {
        const { slug } = await ctx.params;

        const brand = await db.brands.findUnique({
            where: {
                slug
            }
        });

        if (!brand) throw new NotFoundError("Marque");

        return NextResponse.json(brand, {status: 200});
    } catch (error) {
        return handleApiError("BRAND GET", error);
    }
}

export async function PATCH(req: NextRequest, ctx: RouteContext<'/api/v1/brands/[slug]'>) {
    try {
        const { userId } = await auth();

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized", statusCode: 401 }, { status: 401 });
        }

        const { slug } = await ctx.params;
        const body = await req.json();
        const { name, logo, active } = brandPatchSchema.parse(body);

        // Vérifier qu'au moins un champ est fourni
        if (name === undefined && logo === undefined && active === undefined) {
            return NextResponse.json({ error: "Au moins un champ est obligatoire." }, { status: 400 });
        }

        // Construire l'objet de données dynamiquement
        const updateData: UpdateBrandData = {};
        const brand = await db.brands.findUnique({
            where: { slug }
        })

        if (!brand) throw new NotFoundError("Marque");

        // Mettre à jour le slug seulement si le nom change
        if (name !== undefined && name !== brand.name) {
            updateData.name = name;
            updateData.slug = slugifyName(name);
        }

        // Mettre à jour le logo seulement s'il change
        if (logo !== undefined && logo !== brand.logo) {
            updateData.logo = logo;
        }

        // Mettre à jour active seulement s'il change
        if (active !== undefined && active !== brand.active) {
            updateData.active = Boolean(active);
        }

        const updatedBrand = await db.brands.update({
            where: {
                slug
            },
            data: updateData
        });

        return NextResponse.json(updatedBrand, { status: 200 });
    } catch(error) {
        return handleApiError("BRAND PATCH", error);
    }
}

export async function DELETE(_req: NextRequest, ctx: RouteContext<'/api/v1/brands/[slug]'>) {
    const { response } = await requireAdmin();
    if (response) return response;

    try {
        const { slug } = await ctx.params;
        const brand = await db.brands.findUnique({
            where: {
                slug
            }
        });

        if (!brand) throw new NotFoundError("Marque");

        const brandId = brand.id

        await db.brands.delete({
            where: {
                slug
            }
        });

        return new NextResponse(`Brand with id ${brandId} deleted`, { status: 200 });
    } catch (error) {
        return handleApiError("BRAND DELETE", error);
    }
}