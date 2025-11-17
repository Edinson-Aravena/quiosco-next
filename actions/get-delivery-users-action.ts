"use server"

import { prisma } from "@/src/lib/prisma"

export async function getDeliveryUsersAction() {
    try {
        // Obtener usuarios con rol REPARTIDOR desde la tabla user_has_roles
        const deliveryUsers = await prisma.user.findMany({
            where: {
                roles: {
                    some: {
                        roleId: BigInt(6) // ID del rol REPARTIDOR
                    }
                }
            },
            select: {
                id: true,
                name: true,
                lastname: true,
                phone: true,
                image: true
            }
        })

        // Serializar BigInt a string
        const serializedUsers = deliveryUsers.map(user => ({
            ...user,
            id: user.id.toString()
        }))

        return {
            success: true,
            data: serializedUsers
        }
    } catch (error) {
        console.error('Error obteniendo repartidores:', error)
        return {
            success: false,
            error: 'Error al obtener la lista de repartidores',
            data: []
        }
    }
}
