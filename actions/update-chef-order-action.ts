'use server'

import { prisma } from "@/src/lib/prisma"
import { revalidatePath } from "next/cache"

export async function startPreparingOrderAction(orderId: string) {
    try {
        const [type, id] = orderId.split('-')
        
        if (type === 'Q') {
            // Orden de quiosco
            await prisma.order.update({
                where: { id: parseInt(id) },
                data: {
                    orderInProgressAt: new Date()
                }
            })
        } else if (type === 'D') {
            // Orden de delivery
            await prisma.deliveryOrder.update({
                where: { id: BigInt(id) },
                data: {
                    orderInProgressAt: new Date()
                }
            })
        }

        revalidatePath('/chef')
        return { success: true, message: 'Orden en preparación' }
    } catch (error) {
        console.error('Error starting order:', error)
        return { success: false, error: 'Error al iniciar preparación' }
    }
}

export async function markOrderReadyAction(orderId: string) {
    try {
        const [type, id] = orderId.split('-')
        
        if (type === 'Q') {
            // Orden de quiosco
            await prisma.order.update({
                where: { id: parseInt(id) },
                data: {
                    orderReadyAT: new Date(),
                    status: true
                }
            })
        } else if (type === 'D') {
            // Orden de delivery - se mantiene como PAGADO hasta que admin asigne repartidor
            await prisma.deliveryOrder.update({
                where: { id: BigInt(id) },
                data: {
                    orderReadyAt: new Date()
                    // status se mantiene como 'PAGADO' - solo cambia a DESPACHADO cuando admin asigna repartidor
                }
            })
        }

        revalidatePath('/chef')
        revalidatePath('/orders')
        revalidatePath('/admin/orders/delivery')
        return { success: true, message: 'Orden lista para entregar' }
    } catch (error) {
        console.error('Error marking order ready:', error)
        return { success: false, error: 'Error al marcar orden lista' }
    }
}
