import { prisma } from "@/src/lib/prisma"

export async function GET() {

    const orders = await prisma.order.findMany({
        where: {
            status: false
        },
        include: {
            orderProducts: {
                include: {
                    product: true
                }
            }
        }
    })

    // Convertir BigInt y Decimal a tipos serializables
    const serializedOrders = orders.map(order => ({
        ...order,
        orderProducts: order.orderProducts.map(op => ({
            ...op,
            productId: Number(op.productId),
            product: {
                ...op.product,
                id: Number(op.product.id),
                price: Number(op.product.price),
                categoryId: Number(op.product.categoryId)
            }
        }))
    }))

    return Response.json(serializedOrders)
}

