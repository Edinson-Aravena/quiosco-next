import { prisma } from "@/src/lib/prisma";


export async function GET(){
    const orders = await prisma.order.findMany({
        take: 6,
        where: {
            orderReadyAT: {
                not : null
            }
        },
        orderBy: {
            orderReadyAT: 'desc'
        },
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