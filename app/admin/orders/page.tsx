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

  if (isLoading) return <p className="text-center">Cargando órdenes...</p>

  if (error) return <p className="text-center text-red-600">Error al cargar las órdenes</p>

  return (
    <>
      <Heading>Administrar Ordenes</Heading>

      {data?.length ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-5 mt-5">
          {data.map(order => (
            <OrderCard
              key={order.id}
              order={order}
              onComplete={handleOrderComplete}
            />
          ))}
        </div>
      ) : <p className="text-center">No hay ordenes Pendientes</p>}
    </>
  )
}
