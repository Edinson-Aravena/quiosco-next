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
  const [dailyRevenue, weeklyRevenue, monthlyRevenue, yearlyRevenue, totalOrders, totalProducts, avgOrderValue, topProducts] = await Promise.all([
    // Ganancias del día
    prisma.order.aggregate({
      _sum: { total: true },
      where: {
        date: { gte: startOfDay },
        orderDeliveredAt: { not: null }
      }
    }),
    // Ganancias de la semana
    prisma.order.aggregate({
      _sum: { total: true },
      where: {
        date: { gte: startOfWeek },
        orderDeliveredAt: { not: null }
      }
    }),
    // Ganancias del mes
    prisma.order.aggregate({
      _sum: { total: true },
      where: {
        date: { gte: startOfMonth },
        orderDeliveredAt: { not: null }
      }
    }),
    // Ganancias del año
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
    // Productos más vendidos
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
    })
  ]);

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

  // Órdenes recientes
  const recentOrders = await prisma.order.findMany({
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
  });

  return {
    revenue: {
      daily: dailyRevenue._sum.total || 0,
      weekly: weeklyRevenue._sum.total || 0,
      monthly: monthlyRevenue._sum.total || 0,
      yearly: yearlyRevenue._sum.total || 0,
    },
    totalOrders,
    totalProducts,
    avgOrderValue: avgOrderValue._avg.total || 0,
    topProducts: topProductsWithDetails,
    recentOrders
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

      {/* Tarjetas de Ganancias */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Ganancias Diarias */}
        <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="text-5xl opacity-80">💰</div>
            <div className="bg-white bg-opacity-20 rounded-lg px-3 py-1 text-xs font-bold">
              HOY
            </div>
          </div>
          <p className="text-green-100 text-sm font-semibold mb-1">Ganancias Diarias</p>
          <p className="text-3xl font-bold">{formatCurrency(stats.revenue.daily)}</p>
        </div>

        {/* Ganancias Semanales */}
        <div className="bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="text-5xl opacity-80">📊</div>
            <div className="bg-white bg-opacity-20 rounded-lg px-3 py-1 text-xs font-bold">
              SEMANA
            </div>
          </div>
          <p className="text-blue-100 text-sm font-semibold mb-1">Ganancias Semanales</p>
          <p className="text-3xl font-bold">{formatCurrency(stats.revenue.weekly)}</p>
        </div>

        {/* Ganancias Mensuales */}
        <div className="bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="text-5xl opacity-80">🎯</div>
            <div className="bg-white bg-opacity-20 rounded-lg px-3 py-1 text-xs font-bold">
              MES
            </div>
          </div>
          <p className="text-purple-100 text-sm font-semibold mb-1">Ganancias Mensuales</p>
          <p className="text-3xl font-bold">{formatCurrency(stats.revenue.monthly)}</p>
        </div>

        {/* Ganancias Anuales */}
        <div className="bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="text-5xl opacity-80">🏆</div>
            <div className="bg-white bg-opacity-20 rounded-lg px-3 py-1 text-xs font-bold">
              AÑO
            </div>
          </div>
          <p className="text-amber-100 text-sm font-semibold mb-1">Ganancias Anuales</p>
          <p className="text-3xl font-bold">{formatCurrency(stats.revenue.yearly)}</p>
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
            <div className="space-y-4">
              {stats.recentOrders.map((order: any) => (
                <div key={order.id} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {order.name}
                      </div>
                      <span className="font-semibold text-gray-900">Mesa {order.name}</span>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full font-semibold">
                        Entregada
                      </span>
                    </div>
                    <span className="text-lg font-bold text-gray-900">
                      {formatCurrency(order.total)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDate(order.date)} • {order.orderProducts.length} productos
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
