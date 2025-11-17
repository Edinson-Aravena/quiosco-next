"use server"

import { prisma } from "@/src/lib/prisma"
import { revalidatePath } from "next/cache"

export async function assignDeliveryAction(orderId: string, deliveryUserId: string) {
    try {
        // Actualizar la orden asignando el repartidor y cambiando el estado a DESPACHADO
        await prisma.deliveryOrder.update({
            where: {
                id: BigInt(orderId)
            },
            data: {
                deliveryId: BigInt(deliveryUserId),
                status: 'DESPACHADO'
            }
        })

        revalidatePath('/admin/orders/delivery')
        
        return {
            success: true,
            message: 'Repartidor asignado correctamente'
        }
    } catch (error) {
        console.error('Error asignando repartidor:', error)
        return {
            success: false,
            error: 'Error al asignar el repartidor'
        }
    }
}
