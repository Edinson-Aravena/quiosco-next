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
    // Recargar los datos desde el servidor
    await mutate();
  };

  // Función para agrupar órdenes por fecha
  const groupOrdersByDate = (orders: OrderWithProducts[]) => {
    const groups: { [key: string]: OrderWithProducts[] } = {};
    
    orders.forEach(order => {
      const orderDate = new Date(order.date);
      const dateKey = orderDate.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(order);
    });
    
    return groups;
  };

  const isToday = (dateString: string) => {
    const today = new Date().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    return dateString === today;
  };

  const isYesterday = (dateString: string) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    return dateString === yesterdayStr;
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
      {/* Header simple */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <Heading>Órdenes Pendientes</Heading>
            <p className="text-gray-600 mt-2">
              {data?.length ? `${data.length} ${data.length === 1 ? 'orden pendiente' : 'órdenes pendientes'}` : 'No hay órdenes pendientes'}
            </p>
          </div>
          <button
            onClick={() => mutate()}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold rounded-lg shadow-md transition-all hover:shadow-lg active:scale-95"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Actualizar
          </button>
        </div>
      </div>

      {/* Lista de órdenes agrupadas por fecha */}
      {data?.length ? (
        <div className="space-y-8">
          {Object.entries(groupOrdersByDate(data)).map(([dateKey, orders]) => (
            <div key={dateKey} className="space-y-4">
              {/* Grid de órdenes */}
              <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-6">
                {orders.map(order => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onComplete={handleOrderComplete}
                  />
                ))}
              </div>
            </div>
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
