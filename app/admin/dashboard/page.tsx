import { prisma } from "@/src/lib/prisma";
import { formatCurrency } from "@/src/utils";
import Link from "next/link";

async function getDashboardStats() {
  const now = new Date();
  
  // Inicio del día actual (00:00:00)
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  // Inicio de la semana (lunes)
  const startOfWeek = new Date(now);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
  startOfWeek.setDate(diff);
  startOfWeek.setHours(0, 0, 0, 0);
  
  // Inicio del mes
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Inicio del año
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  // Ganancias por período (solo órdenes entregadas)
  const [dailyRevenue, weeklyRevenue, monthlyRevenue, yearlyRevenue, totalOrders, totalProducts, avgOrderValue, topProducts, 
    // Ventas QUIOSCO (Local)
    dailyQuiosco, weeklyQuiosco, monthlyQuiosco, yearlyQuiosco, totalQuiosco,
    // Ventas DELIVERY (App Móvil) 
    dailyDelivery, weeklyDelivery, monthlyDelivery, yearlyDelivery, totalDelivery
  ] = await Promise.all([
    // Ganancias del día (TOTAL)
    prisma.order.aggregate({
      _sum: { total: true },
      where: {
        date: { gte: startOfDay },
        orderDeliveredAt: { not: null }
      }
    }),
    // Ganancias de la semana (TOTAL)
    prisma.order.aggregate({
      _sum: { total: true },
      where: {
        date: { gte: startOfWeek },
        orderDeliveredAt: { not: null }
      }
    }),
    // Ganancias del mes (TOTAL)
    prisma.order.aggregate({
      _sum: { total: true },
      where: {
        date: { gte: startOfMonth },
        orderDeliveredAt: { not: null }
      }
    }),
    // Ganancias del año (TOTAL)
    prisma.order.aggregate({
      _sum: { total: true },
      where: {
        date: { gte: startOfYear },
        orderDeliveredAt: { not: null }
      }
    }),
    // Total de órdenes entregadas
    prisma.order.count({
      where: { orderDeliveredAt: { not: null } }
    }),
    // Total de productos disponibles
    prisma.product.count(),
    // Valor promedio de orden
    prisma.order.aggregate({
      _avg: { total: true },
      where: { orderDeliveredAt: { not: null } }
    }),
    // Productos más vendidos (ambos sistemas)
    prisma.orderProducts.groupBy({
      by: ['productId'],
      _sum: {
        quantity: true
      },
      orderBy: {
        _sum: {
          quantity: 'desc'
        }
      },
      take: 5
    }),
    
    // ========== VENTAS QUIOSCO (LOCAL) ==========
    // Día
    prisma.order.aggregate({
      _sum: { total: true },
      where: {
        date: { gte: startOfDay },
        orderDeliveredAt: { not: null }
      }
    }),
    // Semana
    prisma.order.aggregate({
      _sum: { total: true },
      where: {
        date: { gte: startOfWeek },
        orderDeliveredAt: { not: null }
      }
    }),
    // Mes
    prisma.order.aggregate({
      _sum: { total: true },
      where: {
        date: { gte: startOfMonth },
        orderDeliveredAt: { not: null }
      }
    }),
    // Año
    prisma.order.aggregate({
      _sum: { total: true },
      where: {
        date: { gte: startOfYear },
        orderDeliveredAt: { not: null }
      }
    }),
    // Total órdenes quiosco
    prisma.order.count({
      where: { orderDeliveredAt: { not: null } }
    }),
    
    // ========== VENTAS DELIVERY (APP MÓVIL) ==========
    // Día
    prisma.deliveryOrder.findMany({
      where: {
        createdAt: { gte: startOfDay },
        status: 'ENTREGADO'
      },
      include: {
        orderProducts: {
          include: {
            product: true
          }
        }
      }
    }),
    // Semana
    prisma.deliveryOrder.findMany({
      where: {
        createdAt: { gte: startOfWeek },
        status: 'ENTREGADO'
      },
      include: {
        orderProducts: {
          include: {
            product: true
          }
        }
      }
    }),
    // Mes
    prisma.deliveryOrder.findMany({
      where: {
        createdAt: { gte: startOfMonth },
        status: 'ENTREGADO'
      },
      include: {
        orderProducts: {
          include: {
            product: true
          }
        }
      }
    }),
    // Año
    prisma.deliveryOrder.findMany({
      where: {
        createdAt: { gte: startOfYear },
        status: 'ENTREGADO'
      },
      include: {
        orderProducts: {
          include: {
            product: true
          }
        }
      }
    }),
    // Total órdenes delivery
    prisma.deliveryOrder.count({
      where: { status: 'ENTREGADO' }
    }),
  ]);

  // Calcular totales de delivery
  const calculateDeliveryTotal = (orders: any[]) => {
    return orders.reduce((sum, order) => {
      const orderTotal = order.orderProducts.reduce((total: number, op: any) => {
        return total + (Number(op.quantity) * Number(op.product.price));
      }, 0);
      return sum + orderTotal;
    }, 0);
  };

  const deliveryRevenue = {
    daily: calculateDeliveryTotal(dailyDelivery),
    weekly: calculateDeliveryTotal(weeklyDelivery),
    monthly: calculateDeliveryTotal(monthlyDelivery),
    yearly: calculateDeliveryTotal(yearlyDelivery),
  };

  // Obtener detalles de los productos más vendidos
  const productIds = topProducts.map(p => p.productId);
  const productsDetails = await prisma.product.findMany({
    where: { id: { in: productIds } },
    include: { category: true }
  });

  const topProductsWithDetails = topProducts.map(tp => {
    const product = productsDetails.find(p => p.id === tp.productId);
    return {
      ...product,
      totalSold: tp._sum.quantity || 0
    };
  });

  // Órdenes recientes (ambos sistemas)
  const [recentQuioscoOrders, recentDeliveryOrders] = await Promise.all([
    // Quiosco
    prisma.order.findMany({
      take: 5,
      orderBy: { date: 'desc' },
      where: { orderDeliveredAt: { not: null } },
      include: {
        orderProducts: {
          include: {
            product: true
          }
        }
      }
    }),
    // Delivery
    prisma.deliveryOrder.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      where: { status: 'ENTREGADO' },
      include: {
        client: true,
        orderProducts: {
          include: {
            product: true
          }
        }
      }
    })
  ]);

  return {
    revenue: {
      daily: dailyRevenue._sum.total || 0,
      weekly: weeklyRevenue._sum.total || 0,
      monthly: monthlyRevenue._sum.total || 0,
      yearly: yearlyRevenue._sum.total || 0,
    },
    quioscoRevenue: {
      daily: dailyQuiosco._sum.total || 0,
      weekly: weeklyQuiosco._sum.total || 0,
      monthly: monthlyQuiosco._sum.total || 0,
      yearly: yearlyQuiosco._sum.total || 0,
    },
    deliveryRevenue,
    totalOrders: totalOrders + totalDelivery,
    totalQuioscoOrders: totalQuiosco,
    totalDeliveryOrders: totalDelivery,
    totalProducts,
    avgOrderValue: avgOrderValue._avg.total || 0,
    topProducts: topProductsWithDetails,
    recentOrders: {
      quiosco: recentQuioscoOrders,
      delivery: recentDeliveryOrders
    }
  };
}

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <h1 className="text-3xl font-black text-gray-900">
          Dashboard
          <span className="block w-20 h-1 bg-gradient-to-r from-amber-500 to-orange-500 mt-2 rounded-full"></span>
        </h1>
        <p className="text-gray-600 mt-2">Resumen general del negocio</p>
      </div>

      {/* Tarjetas de Ganancias TOTALES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Ganancias Diarias */}
        <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="text-5xl opacity-80">💰</div>
            <div className="bg-white bg-opacity-20 rounded-lg px-3 py-1 text-xs font-bold">
              HOY
            </div>
          </div>
          <p className="text-green-100 text-sm font-semibold mb-1">Ganancias Diarias TOTALES</p>
          <p className="text-3xl font-bold">{formatCurrency(stats.revenue.daily + stats.deliveryRevenue.daily)}</p>
          <div className="mt-2 pt-2 border-t border-white/20 flex justify-between text-xs">
            <span>Local: {formatCurrency(stats.quioscoRevenue.daily)}</span>
            <span>App: {formatCurrency(stats.deliveryRevenue.daily)}</span>
          </div>
        </div>

        {/* Ganancias Semanales */}
        <div className="bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="text-5xl opacity-80">📊</div>
            <div className="bg-white bg-opacity-20 rounded-lg px-3 py-1 text-xs font-bold">
              SEMANA
            </div>
          </div>
          <p className="text-blue-100 text-sm font-semibold mb-1">Ganancias Semanales TOTALES</p>
          <p className="text-3xl font-bold">{formatCurrency(stats.revenue.weekly + stats.deliveryRevenue.weekly)}</p>
          <div className="mt-2 pt-2 border-t border-white/20 flex justify-between text-xs">
            <span>Local: {formatCurrency(stats.quioscoRevenue.weekly)}</span>
            <span>App: {formatCurrency(stats.deliveryRevenue.weekly)}</span>
          </div>
        </div>

        {/* Ganancias Mensuales */}
        <div className="bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="text-5xl opacity-80">🎯</div>
            <div className="bg-white bg-opacity-20 rounded-lg px-3 py-1 text-xs font-bold">
              MES
            </div>
          </div>
          <p className="text-purple-100 text-sm font-semibold mb-1">Ganancias Mensuales TOTALES</p>
          <p className="text-3xl font-bold">{formatCurrency(stats.revenue.monthly + stats.deliveryRevenue.monthly)}</p>
          <div className="mt-2 pt-2 border-t border-white/20 flex justify-between text-xs">
            <span>Local: {formatCurrency(stats.quioscoRevenue.monthly)}</span>
            <span>App: {formatCurrency(stats.deliveryRevenue.monthly)}</span>
          </div>
        </div>

        {/* Ganancias Anuales */}
        <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="text-5xl opacity-80">🏆</div>
            <div className="bg-white bg-opacity-20 rounded-lg px-3 py-1 text-xs font-bold">
              AÑO
            </div>
          </div>
          <p className="text-amber-100 text-sm font-semibold mb-1">Ganancias Anuales TOTALES</p>
          <p className="text-3xl font-bold">{formatCurrency(stats.revenue.yearly + stats.deliveryRevenue.yearly)}</p>
          <div className="mt-2 pt-2 border-t border-white/20 flex justify-between text-xs">
            <span>Local: {formatCurrency(stats.quioscoRevenue.yearly)}</span>
            <span>App: {formatCurrency(stats.deliveryRevenue.yearly)}</span>
          </div>
        </div>
      </div>

      {/* Comparativa Quiosco vs Delivery */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ventas QUIOSCO (Local) */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>🏪</span>
              Ventas en el Local (Quiosco)
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-xs text-orange-600 font-semibold mb-1">HOY</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.quioscoRevenue.daily)}</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-xs text-orange-600 font-semibold mb-1">SEMANA</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.quioscoRevenue.weekly)}</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-xs text-orange-600 font-semibold mb-1">MES</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.quioscoRevenue.monthly)}</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-xs text-orange-600 font-semibold mb-1">AÑO</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.quioscoRevenue.yearly)}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">Total de órdenes</span>
                <span className="text-2xl font-bold text-orange-600">{stats.totalQuioscoOrders}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Ventas DELIVERY (App Móvil) */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-cyan-500 px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>📱</span>
              Ventas en App Móvil (Delivery)
            </h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-xs text-blue-600 font-semibold mb-1">HOY</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.deliveryRevenue.daily)}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-xs text-blue-600 font-semibold mb-1">SEMANA</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.deliveryRevenue.weekly)}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-xs text-blue-600 font-semibold mb-1">MES</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.deliveryRevenue.monthly)}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-xs text-blue-600 font-semibold mb-1">AÑO</p>
                <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.deliveryRevenue.yearly)}</p>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">Total de órdenes</span>
                <span className="text-2xl font-bold text-blue-600">{stats.totalDeliveryOrders}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estadísticas Generales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Órdenes */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-3xl">
              📦
            </div>
            <div>
              <p className="text-gray-600 text-sm font-semibold">Total Órdenes</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalOrders}</p>
              <p className="text-xs text-gray-500">Órdenes entregadas</p>
            </div>
          </div>
        </div>

        {/* Total Productos */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center text-3xl">
              🍽️
            </div>
            <div>
              <p className="text-gray-600 text-sm font-semibold">Total Productos</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalProducts}</p>
              <p className="text-xs text-gray-500">En el menú</p>
            </div>
          </div>
        </div>

        {/* Promedio por Orden */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-3xl">
              💵
            </div>
            <div>
              <p className="text-gray-600 text-sm font-semibold">Promedio por Orden</p>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.avgOrderValue)}</p>
              <p className="text-xs text-gray-500">Ticket promedio</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Productos Más Vendidos */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>🏅</span>
              Top 5 Productos Más Vendidos
            </h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {stats.topProducts.map((product: any, index) => (
                <div key={product.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                    index === 0 ? 'bg-yellow-500' : 
                    index === 1 ? 'bg-gray-400' : 
                    index === 2 ? 'bg-orange-500' : 
                    'bg-gray-300'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.category.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-amber-600">{product.totalSold}</p>
                    <p className="text-xs text-gray-500">vendidos</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Órdenes Recientes */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-500 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>📋</span>
              Órdenes Recientes
            </h2>
            <Link
              href="/admin/orders/history"
              className="text-white text-sm font-semibold hover:underline"
            >
              Ver todas →
            </Link>
          </div>
          <div className="p-6">
            <h3 className="text-sm font-bold text-gray-600 mb-3">🏪 Local (Quiosco)</h3>
            <div className="space-y-3 mb-6">
              {stats.recentOrders.quiosco.slice(0, 3).map((order: any) => (
                <div key={`q-${order.id}`} className="p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors border border-orange-200">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                        {order.name}
                      </div>
                      <span className="font-semibold text-gray-900 text-sm">Mesa {order.name}</span>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-semibold">
                        Entregada
                      </span>
                    </div>
                    <span className="text-base font-bold text-gray-900">
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600">
                    {formatDate(order.date)} • {order.orderProducts.length} productos
                  </div>
                </div>
              ))}
            </div>

            <h3 className="text-sm font-bold text-gray-600 mb-3">📱 App Móvil (Delivery)</h3>
            <div className="space-y-3">
              {stats.recentOrders.delivery.slice(0, 3).map((order: any) => {
                const total = order.orderProducts.reduce((sum: number, op: any) => 
                  sum + (Number(op.quantity) * Number(op.product.price)), 0
                );
                return (
                  <div key={`d-${order.id}`} className="p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                          {order.client.name.charAt(0)}
                        </div>
                        <span className="font-semibold text-gray-900 text-sm">{order.client.name}</span>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-semibold">
                          Entregado
                        </span>
                      </div>
                      <span className="text-base font-bold text-gray-900">
                        {formatCurrency(total)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600">
                      {formatDate(new Date(Number(order.timestamp)))} • {order.orderProducts.length} productos
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
