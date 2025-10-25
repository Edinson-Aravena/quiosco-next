"use client";

import { OrderWithProducts } from "@/src/types";
import OrderCard from "./OrderCard";
import { useRouter } from "next/navigation";

type ChefOrdersListProps = {
  pendingOrders: OrderWithProducts[];
  inProgressOrders: OrderWithProducts[];
};

export default function ChefOrdersList({ pendingOrders, inProgressOrders }: ChefOrdersListProps) {
  const router = useRouter();

  const handleOrderComplete = async () => {
    // Refrescar la página para obtener los datos actualizados
    router.refresh();
  };

  return (
    <>
      {/* Órdenes Pendientes */}
      {pendingOrders.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-8 bg-yellow-500 rounded-full"></div>
            <h2 className="text-2xl font-bold text-gray-900">
              Órdenes Pendientes ({pendingOrders.length})
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingOrders.map(order => (
              <OrderCard key={order.id} order={order} onComplete={handleOrderComplete} />
            ))}
          </div>
        </div>
      )}

      {/* Órdenes en Preparación */}
      {inProgressOrders.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-2 h-8 bg-orange-500 rounded-full"></div>
            <h2 className="text-2xl font-bold text-gray-900">
              En Preparación ({inProgressOrders.length})
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {inProgressOrders.map(order => (
              <OrderCard key={order.id} order={order} onComplete={handleOrderComplete} />
            ))}
          </div>
        </div>
      )}

      {/* Estado vacío */}
      {pendingOrders.length === 0 && inProgressOrders.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="bg-gray-100 rounded-full p-8 mb-6">
            <svg className="w-24 h-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No hay órdenes activas</h3>
          <p className="text-gray-600">Las nuevas órdenes aparecerán aquí automáticamente</p>
        </div>
      )}
    </>
  );
}
