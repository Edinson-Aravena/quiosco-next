"use client";

import useSWR from "swr";
import { OrderWithProducts } from "@/src/types";
import { formatCurrency } from "@/src/utils";
import { deliverOrderAction } from "@/actions/deliver-order-action";
import { deleteOrderAction } from "@/actions/delete-order-action";
import { toast } from "react-toastify";
import { ArrowPathIcon, ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

export default function ReadyOrdersSidebar() {
  const url = '/orders/api';
  const fetcher = () => fetch(url).then(res => res.json());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const { data, error, isLoading, mutate } = useSWR<OrderWithProducts[]>(url, fetcher, {
    refreshInterval: 60000,
    revalidateOnFocus: true,
    revalidateOnReconnect: true
  });

  const handleOrderClick = async (orderId: number, isDelivered: boolean) => {
    if (isDelivered) {
      try {
        const result = await deleteOrderAction(orderId);
        if (result.success) {
          toast.success("Orden eliminada correctamente");
          mutate();
        } else {
          toast.error(result.error || "Error al eliminar la orden");
        }
      } catch (error) {
        toast.error("Error al eliminar la orden");
      }
    } else {
      try {
        const result = await deliverOrderAction(orderId);
        if (result.success) {
          toast.success("Orden marcada como entregada");
          mutate();
        } else {
          toast.error(result.error || "Error al entregar la orden");
        }
      } catch (error) {
        toast.error("Error al entregar la orden");
      }
    }
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await mutate();
      toast.success("Órdenes actualizadas");
    } catch (err) {
      toast.error("Error al actualizar órdenes");
    } finally {
      setTimeout(() => setIsRefreshing(false), 300);
    }
  };

  const readyOrdersCount = data?.filter(order => !order.orderDeliveredAt).length || 0;
  const deliveredOrdersCount = data?.filter(order => order.orderDeliveredAt).length || 0;

  return (
    <aside className="w-full lg:w-80 xl:w-80 lg:h-screen lg:overflow-y-scroll bg-gradient-to-b from-green-50 to-white lg:border-l border-gray-200 shadow-md lg:shadow-none">
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 sm:p-5 lg:sticky lg:top-0 bg-gradient-to-b from-green-50 to-transparent z-10 hover:bg-green-100 lg:hover:bg-transparent transition-colors border-b lg:border-b-0 border-green-200 cursor-pointer lg:cursor-auto"
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-green-800">
              Órdenes Listas
            </h1>
            <div className="lg:hidden">
              {isOpen ? (
                <ChevronUpIcon className="h-6 w-6 text-green-600" />
              ) : (
                <ChevronDownIcon className="h-6 w-6 text-green-600" />
              )}
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleRefresh();
            }}
            disabled={isRefreshing}
            className="flex-shrink-0 p-2 rounded-full bg-green-100 hover:bg-green-200 text-green-700 transition-all duration-200 hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Actualizar órdenes"
            title="Actualizar órdenes"
          >
            <ArrowPathIcon className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <div className="flex items-center justify-center">
          <div className="h-1 w-20 bg-green-500 rounded-full"></div>
        </div>
        {(readyOrdersCount > 0 || deliveredOrdersCount > 0) && (
          <div className="mt-3 flex gap-2 justify-center flex-wrap">
            {readyOrdersCount > 0 && (
              <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
                {readyOrdersCount} {readyOrdersCount === 1 ? 'lista' : 'listas'}
              </span>
            )}
            {deliveredOrdersCount > 0 && (
              <span className="inline-block bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">
                {deliveredOrdersCount} {deliveredOrdersCount === 1 ? 'entregada' : 'entregadas'}
              </span>
            )}
          </div>
        )}
        <p className="text-center text-xs text-gray-500 mt-2">
          Actualización automática cada minuto
        </p>
      </div>

      <div className={`${isOpen ? 'block' : 'hidden'} lg:block p-4 sm:p-5 pt-0`}>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <p className="text-center mt-4 text-gray-600">Cargando órdenes...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
            <p className="text-red-600 font-medium">Error al cargar las órdenes</p>
          </div>
        ) : !data || data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10">
            <svg className="w-20 h-20 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-center text-gray-500 font-medium">No hay órdenes listas</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.map((order) => {
              const isDelivered = !!order.orderDeliveredAt;
              return (
                <div
                  key={order.id}
                  onClick={() => handleOrderClick(order.id, isDelivered)}
                  className={`rounded-xl p-4 shadow-sm transition-all duration-300 cursor-pointer ${
                    isDelivered
                      ? 'bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-300 hover:border-red-400 hover:shadow-md hover:scale-[1.02]'
                      : 'bg-white border-2 border-green-200 hover:shadow-md hover:border-green-300 hover:scale-[1.02]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3 pb-3 border-b border-opacity-20" style={{ borderColor: isDelivered ? '#93c5fd' : '#86efac' }}>
                    <div className="flex items-center gap-2">
                      <div className={`rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm text-white ${isDelivered ? 'bg-blue-500' : 'bg-green-500'}`}>
                        {order.name}
                      </div>
                      <div>
                        <p className={`text-sm font-semibold ${isDelivered ? 'text-blue-700' : 'text-gray-700'}`}>Mesa {order.name}</p>
                        <p className={`text-xs ${isDelivered ? 'text-blue-600' : 'text-gray-500'}`}>
                          {order.orderProducts.length} {order.orderProducts.length === 1 ? 'producto' : 'productos'}
                        </p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${isDelivered ? 'bg-blue-200 text-blue-800' : 'bg-green-100 text-green-700'}`}>
                      {isDelivered ? 'ENTREGADA' : 'LISTA'}
                    </div>
                  </div>
                  <ul className="space-y-2 mb-3">
                    {order.orderProducts.map((item) => (
                      <li key={item.id} className="flex justify-between items-start text-sm">
                        <div className="flex-1">
                          <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-bold mr-2 ${isDelivered ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                            {item.quantity}x
                          </span>
                          <span className={isDelivered ? 'text-blue-700' : 'text-gray-700'}>{item.product.name}</span>
                        </div>
                        <span className={`font-medium ml-2 ${isDelivered ? 'text-blue-600' : 'text-gray-600'}`}>
                          {formatCurrency(item.product.price * item.quantity)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-3 border-t border-opacity-20" style={{ borderColor: isDelivered ? '#93c5fd' : '#86efac' }}>
                    <div className="flex justify-between items-center">
                      <span className={`text-sm font-semibold ${isDelivered ? 'text-blue-700' : 'text-gray-700'}`}>Total:</span>
                      <span className={`text-lg font-bold ${isDelivered ? 'text-blue-700' : 'text-green-700'}`}>{formatCurrency(order.total)}</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-opacity-20" style={{ borderColor: isDelivered ? '#93c5fd' : '#86efac' }}>
                    {isDelivered ? (
                      <div className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <p className="text-xs text-center text-red-600 font-medium">Click para eliminar</p>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <p className="text-xs text-center text-gray-500 italic">Click para marcar como entregada</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </aside>
  );
}
