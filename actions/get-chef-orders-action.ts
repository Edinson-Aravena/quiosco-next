'use server'

import { prisma } from "@/src/lib/prisma"

export type ChefOrder = {
    orderId: string
    orderType: 'QUIOSCO' | 'DELIVERY'
    customerName: string
    address: string | null
    anotaciones: string | null
    total: number
    orderDate: Date
    prepStatus: 'PENDING' | 'IN_PROGRESS' | 'READY'
    startedAt: Date | null
    readyAt: Date | null
    products: {
        productName: string
        quantity: number
        price: number
        subtotal: number
    }[]
}

export async function getChefOrdersAction(): Promise<ChefOrder[]> {
    try {
        // Obtener órdenes del quiosco pendientes
        const quioscoOrders = await prisma.order.findMany({
            where: {
                orderReadyAT: null
            },
            include: {
                orderProducts: {
                    include: {
                        product: true
                    }
                }
            },
            orderBy: {
                date: 'asc'
            }
        })

        // Obtener órdenes de delivery pendientes (solo PAGADO, sin repartidor asignado)
        const deliveryOrders = await prisma.deliveryOrder.findMany({
            where: {
                status: 'PAGADO',
                orderReadyAt: null
            },
            include: {
                client: true,
                address: true,
                orderProducts: {
                    include: {
                        product: true
                    }
                }
            },
            orderBy: {
                timestamp: 'asc'
            }
        })

        // Mapear órdenes del quiosco
        const mappedQuioscoOrders: ChefOrder[] = quioscoOrders.map(order => ({
            orderId: `Q-${order.id}`,
            orderType: 'QUIOSCO' as const,
            customerName: order.name,
            address: null,
            anotaciones: (order as any).anotaciones ?? null,
            total: order.total,
            orderDate: order.date,
            prepStatus: order.orderReadyAT ? 'READY' : 
                       order.orderInProgressAt ? 'IN_PROGRESS' : 'PENDING',
            startedAt: order.orderInProgressAt,
            readyAt: order.orderReadyAT,
            products: order.orderProducts.map(op => ({
                productName: op.product.name,
                quantity: op.quantity,
                price: Number(op.product.price),
                subtotal: op.quantity * Number(op.product.price)
            }))
        }))

        // Mapear órdenes de delivery
        const mappedDeliveryOrders: ChefOrder[] = deliveryOrders.map(order => {
            const total = order.orderProducts.reduce((sum, op) => 
                sum + (Number(op.quantity) * Number(op.product.price)), 0
            )
            
            return {
                orderId: `D-${order.id}`,
                orderType: 'DELIVERY' as const,
                customerName: order.client.name,
                address: `${order.address.address}, ${order.address.neighborhood}`,
                anotaciones: null,
                total,
                orderDate: new Date(Number(order.timestamp)),
                prepStatus: order.orderReadyAt ? 'READY' : 
                           order.orderInProgressAt ? 'IN_PROGRESS' : 'PENDING',
                startedAt: order.orderInProgressAt,
                readyAt: order.orderReadyAt,
                products: order.orderProducts.map(op => ({
                    productName: op.product.name,
                    quantity: Number(op.quantity),
                    price: Number(op.product.price),
                    subtotal: Number(op.quantity) * Number(op.product.price)
                }))
            }
        })

        // Combinar y ordenar por fecha
        const allOrders = [...mappedQuioscoOrders, ...mappedDeliveryOrders]
            .sort((a, b) => a.orderDate.getTime() - b.orderDate.getTime())

        return allOrders

    } catch (error) {
        console.error('Error getting chef orders:', error)
        return []
    }
}
