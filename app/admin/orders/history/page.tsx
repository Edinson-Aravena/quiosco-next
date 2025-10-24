import { redirect } from "next/navigation";
import Heading from "@/components/ui/Heading";
import { prisma } from "@/src/lib/prisma";
import { formatCurrency } from "@/src/utils";
import Link from "next/link";

async function getAllOrders(
  page: number,
  pageSize: number,
  filterStatus?: string,
  searchTerm?: string
) {
  const skip = (page - 1) * pageSize;

  const whereClause: any = {};

  // Filtros de estado
  if (filterStatus === 'pending') {
    whereClause.status = false;
  } else if (filterStatus === 'ready') {
    whereClause.status = true;
    whereClause.orderDeliveredAt = null;
  } else if (filterStatus === 'delivered') {
    whereClause.orderDeliveredAt = { not: null };
  }

  // Búsqueda por nombre de mesa
  if (searchTerm) {
    whereClause.name = {
      contains: searchTerm,
      mode: 'insensitive'
    };
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
  const [total, pending, ready, delivered] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: false } }),
    prisma.order.count({ where: { status: true, orderDeliveredAt: null } }),
    prisma.order.count({ where: { orderDeliveredAt: { not: null } } })
  ]);

  const totalRevenue = await prisma.order.aggregate({
    _sum: { total: true },
    where: { orderDeliveredAt: { not: null } }
  });

  return { total, pending, ready, delivered, revenue: totalRevenue._sum.total || 0 };
}

export default async function OrderHistoryPage({
  searchParams
}: {
  searchParams: {
    page?: string;
    status?: string;
    search?: string;
  }
}) {
  const page = Number(searchParams.page) || 1;
  const pageSize = 20;
  const filterStatus = searchParams.status;
  const searchTerm = searchParams.search;

  if (page < 1) redirect('/admin/orders/history');

  const [{ orders, totalOrders }, stats] = await Promise.all([
    getAllOrders(page, pageSize, filterStatus, searchTerm),
    getOrderStats()
  ]);

  const totalPages = Math.ceil(totalOrders / pageSize);

  if (page > totalPages && totalPages > 0) redirect('/admin/orders/history');

  const getStatusBadge = (order: any) => {
    if (order.orderDeliveredAt) {
      return {
        text: 'Entregada',
        className: 'bg-blue-100 text-blue-800 border-blue-300'
      };
    } else if (order.status) {
      return {
        text: 'Lista',
        className: 'bg-green-100 text-green-800 border-green-300'
      };
    } else {
      return {
        text: 'Pendiente',
        className: 'bg-yellow-100 text-yellow-800 border-yellow-300'
      };
    }
  };

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

        {/* Estadísticas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center text-xl shadow-md">
                📊
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-900">{stats.total}</p>
                <p className="text-xs text-purple-700 font-medium">Total</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 border border-yellow-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center text-xl shadow-md">
                ⏳
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
                <p className="text-xs text-yellow-700 font-medium">Pendientes</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center text-xl shadow-md">
                ✅
              </div>
              <div>
                <p className="text-2xl font-bold text-green-900">{stats.ready}</p>
                <p className="text-xs text-green-700 font-medium">Listas</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center text-xl shadow-md">
                🚀
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-900">{stats.delivered}</p>
                <p className="text-xs text-blue-700 font-medium">Entregadas</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-4 border border-emerald-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center text-xl shadow-md">
                💰
              </div>
              <div>
                <p className="text-2xl font-bold text-emerald-900">{formatCurrency(stats.revenue)}</p>
                <p className="text-xs text-emerald-700 font-medium">Ingresos</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <form className="flex-1 flex gap-3" action="/admin/orders/history">
            <input
              type="text"
              name="search"
              defaultValue={searchTerm}
              placeholder="Buscar por mesa..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-colors"
            >
              Buscar
            </button>
          </form>

          <div className="flex gap-2">
            <Link
              href="/admin/orders/history?page=1"
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                !filterStatus
                  ? 'bg-amber-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Todas
            </Link>
            <Link
              href="/admin/orders/history?page=1&status=pending"
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'pending'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Pendientes
            </Link>
            <Link
              href="/admin/orders/history?page=1&status=ready"
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'ready'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Listas
            </Link>
            <Link
              href="/admin/orders/history?page=1&status=delivered"
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filterStatus === 'delivered'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Entregadas
            </Link>
          </div>
        </div>
      </div>

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
                    <th className="px-6 py-4 text-left text-sm font-bold">Estado</th>
                    <th className="px-6 py-4 text-left text-sm font-bold">Entregada</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {orders.map((order, index) => {
                    const statusBadge = getStatusBadge(order);
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
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-bold border ${statusBadge.className}`}
                          >
                            {statusBadge.text}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {order.orderDeliveredAt ? formatDate(order.orderDeliveredAt) : '-'}
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
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Mostrando página {page} de {totalPages} ({totalOrders} órdenes totales)
                </p>
                <div className="flex gap-2">
                  {page > 1 && (
                    <Link
                      href={`/admin/orders/history?page=${page - 1}${filterStatus ? `&status=${filterStatus}` : ''}${searchTerm ? `&search=${searchTerm}` : ''}`}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                    >
                      Anterior
                    </Link>
                  )}
                  {page < totalPages && (
                    <Link
                      href={`/admin/orders/history?page=${page + 1}${filterStatus ? `&status=${filterStatus}` : ''}${searchTerm ? `&search=${searchTerm}` : ''}`}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors"
                    >
                      Siguiente
                    </Link>
                  )}
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
