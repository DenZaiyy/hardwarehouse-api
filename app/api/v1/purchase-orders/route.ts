import {NextRequest, NextResponse} from "next/server";
import {db} from "@/lib/db";
import {currentUser} from "@clerk/nextjs/server";
import {requireAdmin} from "@/lib/auth/require-role";
import {handleApiError} from "@/lib/api/handle-api-error";
import {NotFoundError} from "@/lib/api/errors";
import {purchaseOrderSchema} from "@/lib/validators/purchaseOrderSchema";

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(_req: NextRequest) {
    const { response } = await requireAdmin();
    if (response) return response;

    try {
        const purchases = await db.purchaseOrder.findMany({
            include: {
                product: {
                    select: {
                        id: true,
                        name: true,
                        price: true
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        return NextResponse.json(purchases, {status: 200});
    } catch (error) {
        return handleApiError("PURCHASE ORDERS GET", error);
    }
}

export async function POST(req: NextRequest) {
    const { userId, response } = await requireAdmin();
    if (response) return response;

    try {
        const { quantity, productId } = purchaseOrderSchema.parse(await req.json());
        const user = await currentUser()

        const userFullName = user?.fullName ?? "Undefined User"

        const existingProduct = await db.products.findUnique({
            where: {
                id: productId
            }
        })

        if (!existingProduct) throw new NotFoundError("Produit");

        const purchaseOrder = await db.purchaseOrder.create({
            data: {
                quantity,
                userFullName,
                product: {
                    connect: {
                        id: productId
                    }
                },
                userId
            }
        })

        if (purchaseOrder) {
            // Generate PDF

        }

        return NextResponse.json(purchaseOrder, { status: 200 })

    } catch (error) {
        return handleApiError("PURCHASE ORDER POST", error);
    }
}