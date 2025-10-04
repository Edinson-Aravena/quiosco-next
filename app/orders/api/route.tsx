import { prisma } from "@/src/lib/prisma";


export async function GET(){
    const orders = await prisma.order.findMany({
        take: 10,
        where: {
            orderReadyAT: {
                not : null
            }
        },
        orderBy: [
            {
                orderDeliveredAt: 'asc' // Las no entregadas primero (null values first)
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