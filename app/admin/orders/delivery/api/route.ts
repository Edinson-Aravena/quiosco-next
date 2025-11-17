import { prisma } from "@/src/lib/prisma"

export async function GET() {
    try {
        // Obtener órdenes de delivery listas para asignar (PAGADO + orderReadyAt) o ya despachadas
        const orders = await prisma.deliveryOrder.findMany({
            where: {
                OR: [
                    {
                        status: 'PAGADO',
                        orderReadyAt: { not: null }
                    },
                    {
                        status: 'DESPACHADO'
                    },
                    {
                        status: 'EN CAMINO'
                    }
                ]
            },
            include: {
                client: {
                    select: {
                        id: true,
                        name: true,
                        lastname: true,
                        phone: true,
                        email: true
                    }
                },
                delivery: {
                    select: {
                        id: true,
                        name: true,
                        lastname: true,
                        phone: true
                    }
                },
                address: {
                    select: {
                        id: true,
                        address: true,
                        neighborhood: true
                    }
                },
                orderProducts: {
                    include: {
                        product: true
                    }
                }
            },
            orderBy: {
                timestamp: 'desc'
            }
        })

        // Serializar BigInt y Decimal - ser explícito con todos los campos
        const serializedOrders = orders.map(order => ({
            id: order.id.toString(),
            clientId: order.clientId.toString(),
            deliveryId: order.deliveryId?.toString() || null,
            addressId: order.addressId.toString(),
            lat: order.lat,
            lng: order.lng,
            status: order.status,
            timestamp: order.timestamp.toString(),
            orderInProgressAt: order.orderInProgressAt,
            orderReadyAt: order.orderReadyAt,
            orderDeliveredAt: order.orderDeliveredAt,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
            client: order.client ? {
                id: order.client.id.toString(),
                name: order.client.name,
                lastname: order.client.lastname,
                phone: order.client.phone,
                email: order.client.email
            } : null,
            delivery: order.delivery ? {
                id: order.delivery.id.toString(),
                name: order.delivery.name,
                lastname: order.delivery.lastname,
                phone: order.delivery.phone
            } : null,
            address: order.address ? {
                id: order.address.id.toString(),
                address: order.address.address,
                neighborhood: order.address.neighborhood
            } : null,
            deliveryOrderProducts: order.orderProducts.map(op => ({
                productId: op.productId.toString(),
                quantity: Number(op.quantity),
                product: {
                    id: op.product.id.toString(),
                    name: op.product.name,
                    price: Number(op.product.price),
                    image: op.product.image
                }
            }))
        }))

        return Response.json(serializedOrders)
    } catch (error) {
        console.error('Error obteniendo órdenes de delivery:', error)
        return Response.json({ error: 'Error al obtener las órdenes' }, { status: 500 })
    }
}
