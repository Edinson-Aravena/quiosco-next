import { prisma } from '../src/lib/prisma'

async function checkDeliveryOrders() {
    console.log('🔍 Verificando órdenes de delivery...\n')

    // Todas las órdenes
    const allOrders = await prisma.deliveryOrder.findMany({
        select: {
            id: true,
            status: true,
            orderInProgressAt: true,
            orderReadyAt: true,
            orderDeliveredAt: true,
            timestamp: true,
            client: {
                select: {
                    name: true
                }
            }
        },
        orderBy: {
            timestamp: 'desc'
        }
    })

    console.log(`Total de órdenes: ${allOrders.length}\n`)

    allOrders.forEach(order => {
        console.log(`📦 Orden ID: ${order.id}`)
        console.log(`   Cliente: ${order.client.name}`)
        console.log(`   Status: ${order.status}`)
        console.log(`   En progreso: ${order.orderInProgressAt ? '✅' : '❌'}`)
        console.log(`   Lista: ${order.orderReadyAt ? '✅' : '❌'}`)
        console.log(`   Entregada: ${order.orderDeliveredAt ? '✅' : '❌'}`)
        console.log(`   Fecha: ${new Date(Number(order.timestamp)).toLocaleString()}`)
        console.log('---')
    })

    // Órdenes que deberían aparecer en /admin/orders/delivery
    const visibleOrders = await prisma.deliveryOrder.findMany({
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
        }
    })

    console.log(`\n✨ Órdenes que deberían aparecer en /admin/orders/delivery: ${visibleOrders.length}`)
    
    if (visibleOrders.length > 0) {
        console.log('\nDetalles:')
        visibleOrders.forEach(order => {
            console.log(`  - Orden ${order.id}: ${order.status} ${order.orderReadyAt ? '(Lista)' : '(No lista)'}`)
        })
    }

    await prisma.$disconnect()
}

checkDeliveryOrders().catch(console.error)
