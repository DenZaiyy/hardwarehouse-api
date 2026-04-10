import {NextRequest} from "next/server";
import {handleApiError} from "@/lib/api/handle-api-error";

type RouteCtx = RouteContext<'/api/v1/discounts/category/[slug]'>;


export async function GET(_req: NextRequest, ctx: RouteCtx) {
    try {
        const { slug } = await ctx.params;

        //return NextResponse.json(product, { status: 200 });
    } catch (error) {
        return handleApiError('DISCOUNT CATEGORY', error);
    }
}