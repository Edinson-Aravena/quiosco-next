const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function test() {
    try {
        console.log('🔍 Probando consulta de órdenes de delivery...\n')
        
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
                client: true,
                delivery: true,
                address: true,
                orderProducts: {
                    include: {
                        product: true
                    }
                }
            }
        })

        console.log(`✅ Órdenes encontradas: ${orders.length}\n`)
        
        if (orders.length > 0) {
            orders.forEach(order => {
                console.log(`📦 Orden ID: ${order.id}`)
                console.log(`   Cliente: ${order.client.name} ${order.client.lastname || ''}`)
                console.log(`   Status: ${order.status}`)
                console.log(`   En progreso: ${order.orderInProgressAt ? '✅' : '❌'}`)
                console.log(`   Lista: ${order.orderReadyAt ? '✅' : '❌'}`)
                console.log(`   Productos: ${order.orderProducts.length}`)
                console.log('---')
            })
        } else {
            console.log('❌ No hay órdenes que cumplan los criterios')
            
            // Verificar si hay órdenes PAGADO sin importar orderReadyAt
            const allPagado = await prisma.deliveryOrder.findMany({
                where: { status: 'PAGADO' }
            })
            console.log(`\nÓrdenes con status PAGADO (total): ${allPagado.length}`)
            
            if (allPagado.length > 0) {
                allPagado.forEach(o => {
                    console.log(`  - Orden ${o.id}: orderReadyAt = ${o.orderReadyAt ? 'SI' : 'NO'}`)
                })
            }
        }

    } catch (error) {
        console.error('❌ Error:', error)
    } finally {
        await prisma.$disconnect()
    }
}

test()
