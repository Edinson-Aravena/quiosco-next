import { prisma } from "@/src/lib/prisma";


export async function GET(){
    // Fecha de hace 1 hora para filtrar órdenes antiguas
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const orders = await prisma.order.findMany({
        take: 20,
        where: {
            orderReadyAT: {
                not : null
            },
            OR: [
                // Órdenes no entregadas
                { orderDeliveredAt: null },
                // O órdenes entregadas hace menos de 1 hora
                { 
                    orderDeliveredAt: { 
                        gte: oneHourAgo 
                    } 
                }
            ]
        },
        orderBy: [
            {
                orderDeliveredAt: 'asc' // null primero (no entregadas)
            },
            {
                orderReadyAT: 'desc'
            }
        ],
        include: {
            orderProducts: {
                include: {
                    product: true
                }
            }
        }
    })
    return Response.json(orders)
}