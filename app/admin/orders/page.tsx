"use client"
import useSWR from "swr";
import OrderCard from "@/components/order/OrderCard";
import Heading from "@/components/ui/Heading";
import { OrderWithProducts } from "@/src/types";

export default function OrdersPage() {
  const url = '/admin/orders/api'
  const fetcher = () => fetch(url).then(res => res.json())

  const { data, error, isLoading, mutate } = useSWR<OrderWithProducts[]>(url, fetcher, {
    refreshInterval: 60000,
    revalidateOnFocus: false
  })

  const handleOrderComplete = async (orderId: number) => {
    // Actualizar la UI inmediatamente
    const updatedOrders = data?.filter(order => order.id !== orderId);
    await mutate(updatedOrders, false);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-4 border-amber-200 rounded-full"></div>
          <div className="absolute inset-0 border-4 border-amber-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="mt-4 text-gray-600 font-medium">Cargando órdenes...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="text-6xl mb-4">⚠️</div>
        <p className="text-red-600 font-semibold text-lg">Error al cargar las órdenes</p>
        <p className="text-gray-500 text-sm mt-2">Por favor, intenta recargar la página</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header con estadísticas */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <Heading>Administrar Órdenes</Heading>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-2xl shadow-md">
                📋
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-900">{data?.length || 0}</p>
                <p className="text-sm text-blue-700 font-medium">Órdenes Pendientes</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-2xl shadow-md">
                💰
              </div>
              <div>
                <p className="text-2xl font-bold text-green-900">
                  ${data?.reduce((sum, order) => sum + order.total, 0).toFixed(2) || '0.00'}
                </p>
                <p className="text-sm text-green-700 font-medium">Total en Órdenes</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-500 rounded-lg flex items-center justify-center text-2xl shadow-md">
                🍽️
              </div>
              <div>
                <p className="text-2xl font-bold text-amber-900">
                  {data?.reduce((sum, order) => sum + order.orderProducts.length, 0) || 0}
                </p>
                <p className="text-sm text-amber-700 font-medium">Productos Totales</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de órdenes */}
      {data?.length ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
          {data.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              onComplete={handleOrderComplete}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-xl font-semibold text-gray-700 mb-2">No hay órdenes pendientes</p>
          <p className="text-gray-500">Las nuevas órdenes aparecerán aquí automáticamente</p>
        </div>
      )}
    </div>
  )
}
