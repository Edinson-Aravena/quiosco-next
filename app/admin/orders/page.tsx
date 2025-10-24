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
        <Heading>Órdenes Pendientes</Heading>
        <p className="text-gray-600 mt-2">
          {data?.length ? `${data.length} ${data.length === 1 ? 'orden pendiente' : 'órdenes pendientes'}` : 'No hay órdenes pendientes'}
        </p>
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
