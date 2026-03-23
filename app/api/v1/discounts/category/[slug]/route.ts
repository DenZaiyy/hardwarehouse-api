import {NextRequest, NextResponse} from "next/server";

interface RouteParams {
    params: Promise<{ slug: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
    try {
        const { slug } = await params;

        //return NextResponse.json(product, { status: 200 });
    } catch (error) {
        if (error instanceof Error) {
            console.error('[DISCOUNT CATEGORY] ', error.message)
            return NextResponse.json(
                { error: `[DISCOUNT CATEGORY] Erreur interne : ${error ? error.message : 'Erreur inconnue'}` },
                { status: 500 }
            );
        }

    }
}