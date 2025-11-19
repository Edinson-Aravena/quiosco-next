import { prisma } from "./prisma";

/**
 * Obtiene estadísticas de productos más vendidos
 */
export async function getTopSellingProducts(limit: number = 10, days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Productos del quiosco/local
  const quioscoProducts = await prisma.orderProducts.groupBy({
    by: ['productId'],
    _sum: {
      quantity: true
    },
    where: {
      order: {
        date: {
          gte: startDate
        },
        orderDeliveredAt: {
          not: null
        }
      }
    },
    orderBy: {
      _sum: {
        quantity: 'desc'
      }
    },
    take: limit
  });

  // Productos de delivery
  const deliveryProducts = await prisma.deliveryOrderHasProduct.groupBy({
    by: ['productId'],
    _sum: {
      quantity: true
    },
    where: {
      order: {
        createdAt: {
          gte: startDate
        },
        status: 'ENTREGADO'
      }
    },
    orderBy: {
      _sum: {
        quantity: 'desc'
      }
    },
    take: limit
  });

  // Combinar y obtener detalles de productos
  const productIds = [
    ...quioscoProducts.map(p => p.productId),
    ...deliveryProducts.map(p => p.productId)
  ];

  const products = await prisma.product.findMany({
    where: {
      id: {
        in: productIds
      }
    },
    include: {
      category: true
    }
  });

  // Mapear con cantidades totales
  const productMap = new Map();
  
  quioscoProducts.forEach(p => {
    const qty = p._sum.quantity || 0;
    productMap.set(p.productId.toString(), (productMap.get(p.productId.toString()) || 0) + qty);
  });

  deliveryProducts.forEach(p => {
    const qty = Number(p._sum.quantity) || 0;
    productMap.set(p.productId.toString(), (productMap.get(p.productId.toString()) || 0) + qty);
  });

  return products
    .map(product => ({
      id: product.id,
      name: product.name,
      category: product.category.name,
      totalSold: productMap.get(product.id.toString()) || 0,
      price: Number(product.price)
    }))
    .sort((a, b) => b.totalSold - a.totalSold)
    .slice(0, limit);
}

/**
 * Obtiene categorías más vendidas
 */
export async function getTopSellingCategories(days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const categories = await prisma.category.findMany({
    include: {
      products: {
        include: {
          orderItems: {
            where: {
              order: {
                date: {
                  gte: startDate
                },
                orderDeliveredAt: {
                  not: null
                }
              }
            }
          },
          deliveryOrderProducts: {
            where: {
              order: {
                createdAt: {
                  gte: startDate
                },
                status: 'ENTREGADO'
              }
            }
          }
        }
      }
    }
  });

  return categories.map(category => {
    const totalSold = category.products.reduce((sum, product) => {
      const quioscoQty = product.orderItems.reduce((s, oi) => s + oi.quantity, 0);
      const deliveryQty = product.deliveryOrderProducts.reduce((s, dop) => s + Number(dop.quantity), 0);
      return sum + quioscoQty + deliveryQty;
    }, 0);

    const totalRevenue = category.products.reduce((sum, product) => {
      const quioscoQty = product.orderItems.reduce((s, oi) => s + oi.quantity, 0);
      const deliveryQty = product.deliveryOrderProducts.reduce((s, dop) => s + Number(dop.quantity), 0);
      return sum + ((quioscoQty + deliveryQty) * Number(product.price));
    }, 0);

    return {
      name: category.name,
      totalSold,
      totalRevenue,
      productCount: category.products.length
    };
  }).sort((a, b) => b.totalSold - a.totalSold);
}

/**
 * Obtiene estadísticas de ventas por período
 */
export async function getSalesStats(days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Órdenes del quiosco/local
  const quioscoOrders = await prisma.order.findMany({
    where: {
      date: {
        gte: startDate
      },
      orderDeliveredAt: {
        not: null
      }
    },
    include: {
      orderProducts: {
        include: {
          product: true
        }
      }
    }
  });

  // Órdenes de delivery
  const deliveryOrders = await prisma.deliveryOrder.findMany({
    where: {
      createdAt: {
        gte: startDate
      },
      status: 'ENTREGADO'
    },
    include: {
      orderProducts: {
        include: {
          product: true
        }
      }
    }
  });

  const totalQuioscoRevenue = quioscoOrders.reduce((sum, order) => sum + order.total, 0);
  const totalDeliveryRevenue = deliveryOrders.reduce((sum, order) => {
    const orderTotal = order.orderProducts.reduce((s, op) => {
      return s + (Number(op.quantity) * Number(op.product.price));
    }, 0);
    return sum + orderTotal;
  }, 0);

  return {
    totalOrders: quioscoOrders.length + deliveryOrders.length,
    totalRevenue: totalQuioscoRevenue + totalDeliveryRevenue,
    quioscoOrders: quioscoOrders.length,
    quioscoRevenue: totalQuioscoRevenue,
    deliveryOrders: deliveryOrders.length,
    deliveryRevenue: totalDeliveryRevenue,
    averageOrderValue: (totalQuioscoRevenue + totalDeliveryRevenue) / (quioscoOrders.length + deliveryOrders.length),
    period: `Últimos ${days} días`
  };
}

/**
 * Obtiene productos con menos ventas (candidatos a eliminar o promocionar)
 */
export async function getLowSellingProducts(limit: number = 10, days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const allProducts = await prisma.product.findMany({
    include: {
      category: true,
      orderItems: {
        where: {
          order: {
            date: {
              gte: startDate
            },
            orderDeliveredAt: {
              not: null
            }
          }
        }
      },
      deliveryOrderProducts: {
        where: {
          order: {
            createdAt: {
              gte: startDate
            },
            status: 'ENTREGADO'
          }
        }
      }
    }
  });

  return allProducts
    .map(product => {
      const quioscoQty = product.orderItems.reduce((s, oi) => s + oi.quantity, 0);
      const deliveryQty = product.deliveryOrderProducts.reduce((s, dop) => s + Number(dop.quantity), 0);
      const totalSold = quioscoQty + deliveryQty;

      return {
        id: product.id,
        name: product.name,
        category: product.category.name,
        totalSold,
        price: Number(product.price)
      };
    })
    .sort((a, b) => a.totalSold - b.totalSold)
    .slice(0, limit);
}

/**
 * Obtiene tendencias por día de la semana
 */
export async function getSalesByDayOfWeek(days: number = 30) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const quioscoOrders = await prisma.order.findMany({
    where: {
      date: {
        gte: startDate
      },
      orderDeliveredAt: {
        not: null
      }
    },
    select: {
      date: true,
      total: true
    }
  });

  const deliveryOrders = await prisma.deliveryOrder.findMany({
    where: {
      createdAt: {
        gte: startDate
      },
      status: 'ENTREGADO'
    },
    select: {
      createdAt: true,
      orderProducts: {
        include: {
          product: true
        }
      }
    }
  });

  const dayNames = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  const dayStats = Array.from({ length: 7 }, () => ({ orders: 0, revenue: 0 }));

  quioscoOrders.forEach(order => {
    const dayIndex = new Date(order.date).getDay();
    dayStats[dayIndex].orders++;
    dayStats[dayIndex].revenue += order.total;
  });

  deliveryOrders.forEach(order => {
    const dayIndex = new Date(Number(order.createdAt)).getDay();
    const orderTotal = order.orderProducts.reduce((sum, op) => {
      return sum + (Number(op.quantity) * Number(op.product.price));
    }, 0);
    dayStats[dayIndex].orders++;
    dayStats[dayIndex].revenue += orderTotal;
  });

  return dayStats.map((stats, index) => ({
    day: dayNames[index],
    orders: stats.orders,
    revenue: stats.revenue,
    averageOrderValue: stats.orders > 0 ? stats.revenue / stats.orders : 0
  }));
}

/**
 * Genera un resumen completo del negocio para el contexto del chatbot
 */
export async function getBusinessSummary(days: number = 30) {
  const [topProducts, topCategories, salesStats, lowProducts, dayStats] = await Promise.all([
    getTopSellingProducts(10, days),
    getTopSellingCategories(days),
    getSalesStats(days),
    getLowSellingProducts(5, days),
    getSalesByDayOfWeek(days)
  ]);

  return {
    topProducts,
    topCategories,
    salesStats,
    lowProducts,
    dayStats,
    period: `Últimos ${days} días`
  };
}
