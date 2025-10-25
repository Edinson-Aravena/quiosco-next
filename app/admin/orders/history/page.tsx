import { redirect } from "next/navigation";
import Heading from "@/components/ui/Heading";
import { prisma } from "@/src/lib/prisma";
import { formatCurrency } from "@/src/utils";
import Link from "next/link";
import OrderHistoryFilters from "@/components/admin/OrderHistoryFilters";

async function getAllOrders(
  page: number,
  pageSize: number,
  filterCategory?: string,
  filterTable?: string
) {
  const skip = (page - 1) * pageSize;

  const whereClause: any = {};

  // Filtro de categoría
  if (filterCategory) {
    whereClause.orderProducts = {
      some: {
        product: {
          categoryId: parseInt(filterCategory)
        }
      }
    };
  }

  // Filtro por nombre de mesa
  if (filterTable) {
    whereClause.name = filterTable;
  }

  const [orders, totalOrders] = await Promise.all([
    prisma.order.findMany({
      take: pageSize,
      skip,
      where: whereClause,
      orderBy: {
        date: 'desc'
      },
      include: {
        orderProducts: {
          include: {
            product: true
          }
        }
      }
    }),
    prisma.order.count({ where: whereClause })
  ]);

  return { orders, totalOrders };
}

async function getOrderStats() {
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

  // Ganancias del día (solo órdenes entregadas)
  const dailyOrders = await prisma.order.aggregate({
    _sum: { total: true },
    where: {
      date: { gte: startOfDay },
      orderDeliveredAt: { not: null }
    }
  });

  // Ganancias de la semana
  const weeklyOrders = await prisma.order.aggregate({
    _sum: { total: true },
    where: {
      date: { gte: startOfWeek },
      orderDeliveredAt: { not: null }
    }
  });

  // Ganancias del mes
  const monthlyOrders = await prisma.order.aggregate({
    _sum: { total: true },
    where: {
      date: { gte: startOfMonth },
      orderDeliveredAt: { not: null }
    }
  });

  return {
    daily: dailyOrders._sum.total || 0,
    weekly: weeklyOrders._sum.total || 0,
    monthly: monthlyOrders._sum.total || 0
  };
}

export default async function OrderHistoryPage({
  searchParams
}: {
  searchParams: {
    page?: string;
    category?: string;
    table?: string;
  }
}) {
  const page = Number(searchParams.page) || 1;
  const pageSize = 10;
  const filterCategory = searchParams.category;
  const filterTable = searchParams.table;

  if (page < 1) redirect('/admin/orders/history');

  // Obtener todas las categorías para los filtros
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  });

  const [{ orders, totalOrders }, stats] = await Promise.all([
    getAllOrders(page, pageSize, filterCategory, filterTable),
    getOrderStats()
  ]);

  const totalPages = Math.ceil(totalOrders / pageSize);

  if (page > totalPages && totalPages > 0) redirect('/admin/orders/history');

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
        <div className="flex items-center justify-between mb-6">
          <Heading>Historial de Órdenes</Heading>
          <Link
            href="/admin/orders"
            className="text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver a Órdenes Pendientes
          </Link>
        </div>

        {/* Estadísticas de Ganancias */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-semibold">Ganancias Diarias</p>
                <p className="text-3xl font-bold mt-1">{formatCurrency(stats.daily)}</p>
                <p className="text-green-100 text-xs mt-1">Hoy</p>
              </div>
              <div className="text-5xl opacity-80">💰</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-semibold">Ganancias Semanales</p>
                <p className="text-3xl font-bold mt-1">{formatCurrency(stats.weekly)}</p>
                <p className="text-blue-100 text-xs mt-1">Esta semana</p>
              </div>
              <div className="text-5xl opacity-80">📊</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-semibold">Ganancias Mensuales</p>
                <p className="text-3xl font-bold mt-1">{formatCurrency(stats.monthly)}</p>
                <p className="text-purple-100 text-xs mt-1">Este mes</p>
              </div>
              <div className="text-5xl opacity-80">🎯</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <OrderHistoryFilters
        categories={categories}
        filterCategory={filterCategory}
        filterTable={filterTable}
      />

      {/* Tabla de órdenes */}
      {orders.length > 0 ? (
        <>
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-bold">ID</th>
                    <th className="px-6 py-4 text-left text-sm font-bold">Mesa</th>
                    <th className="px-6 py-4 text-left text-sm font-bold">Productos</th>
                    <th className="px-6 py-4 text-left text-sm font-bold">Total</th>
                    <th className="px-6 py-4 text-left text-sm font-bold">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.map((order, index) => {
                    return (
                      <tr
                        key={order.id}
                        className={`hover:bg-gray-50 transition-colors ${
                          index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'
                        }`}
                      >
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                          #{order.id}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {order.name}
                            </div>
                            <span className="font-medium text-gray-900">{order.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            {order.orderProducts.map((item) => (
                              <div key={item.id} className="text-sm text-gray-600">
                                <span className="font-semibold text-gray-900">{item.quantity}x</span> {item.product.name}
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-lg font-bold text-gray-900">
                          {formatCurrency(order.total)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {formatDate(order.date)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-center">
                <div className="flex items-center gap-2">
                  {/* Botón Anterior */}
                  <Link
                    href={page > 1 ? `/admin/orders/history?page=${page - 1}${filterCategory ? `&category=${filterCategory}` : ''}${filterTable ? `&table=${filterTable}` : ''}` : '#'}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      page > 1
                        ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none'
                    }`}
                  >
                    Anterior
                  </Link>

                  {/* Números de página */}
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                    // Mostrar solo páginas cercanas a la actual
                    if (
                      pageNum === 1 ||
                      pageNum === totalPages ||
                      (pageNum >= page - 1 && pageNum <= page + 1)
                    ) {
                      return (
                        <Link
                          key={pageNum}
                          href={`/admin/orders/history?page=${pageNum}${filterCategory ? `&category=${filterCategory}` : ''}${filterTable ? `&table=${filterTable}` : ''}`}
                          className={`w-10 h-10 flex items-center justify-center rounded-lg font-semibold transition-colors ${
                            pageNum === page
                              ? 'bg-amber-500 text-white shadow-md'
                              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {pageNum}
                        </Link>
                      );
                    } else if (pageNum === page - 2 || pageNum === page + 2) {
                      return (
                        <span key={pageNum} className="px-2 text-gray-400">
                          ...
                        </span>
                      );
                    }
                    return null;
                  })}

                  {/* Botón Siguiente */}
                  <Link
                    href={page < totalPages ? `/admin/orders/history?page=${page + 1}${filterCategory ? `&category=${filterCategory}` : ''}${filterTable ? `&table=${filterTable}` : ''}` : '#'}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      page < totalPages
                        ? 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed pointer-events-none'
                    }`}
                  >
                    Siguiente
                  </Link>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-xl font-semibold text-gray-700 mb-2">No se encontraron órdenes</p>
          <p className="text-gray-500">Intenta ajustar los filtros de búsqueda</p>
        </div>
      )}
    </div>
  );
}
