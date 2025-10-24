"use client";

import useSWR from "swr";
import { OrderWithProducts } from "@/src/types";
import { formatCurrency } from "@/src/utils";
import { deliverOrderAction } from "@/actions/deliver-order-action";
import { hideOrderAction } from "@/actions/hide-order-action";
import { toast } from "react-toastify";
import { ArrowPathIcon, ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

export default function ReadyOrdersSidebar() {
  const url = '/orders/api';
  const fetcher = () => fetch(url).then(res => res.json());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true); // Estado para expandir/colapsar en desktop

  const { data, error, isLoading, mutate } = useSWR<OrderWithProducts[]>(url, fetcher, {
    refreshInterval: 60000,
    revalidateOnFocus: true,
    revalidateOnReconnect: true
  });

  const handleOrderClick = async (orderId: number, isDelivered: boolean) => {
    if (!isDelivered) {
      // Primer click: marcar como entregada
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
    } else {
      // Segundo click: ocultar del panel
      try {
        const result = await hideOrderAction(orderId);
        if (result.success) {
          toast.success("Orden removida del panel");
          mutate();
        } else {
          toast.error(result.error || "Error al ocultar la orden");
        }
      } catch (error) {
        toast.error("Error al ocultar la orden");
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
    <aside className={`w-full transition-all duration-300 lg:h-screen lg:overflow-y-scroll bg-white lg:border-l border-gray-200 shadow-sm ${
      (!data || data.length === 0 || !isExpanded) ? 'lg:w-16' : 'lg:w-64 xl:w-72 2xl:w-80'
    }`}>
      {/* Header moderno y compacto */}
      <div
        onClick={() => {
          setIsOpen(!isOpen); // Toggle para móvil
          setIsExpanded(!isExpanded); // Toggle para desktop
        }}
        className={`w-full lg:sticky lg:top-0 bg-gradient-to-r from-green-500 to-emerald-500 cursor-pointer transition-all shadow-sm ${
          (!data || data.length === 0 || !isExpanded) ? 'lg:py-4 lg:px-2' : 'p-3'
        }`}
      >
        {(!data || data.length === 0 || !isExpanded) ? (
          // Vista compactada - Solo icono vertical en desktop
          <div className="flex lg:flex-col items-center justify-between lg:justify-center gap-2">
            <div className="flex items-center gap-2 lg:flex-col">
              <div className="bg-white bg-opacity-20 rounded-lg p-2">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h1 className="text-sm font-bold text-white lg:hidden">Órdenes</h1>
              <p className="text-xs text-green-100 lg:hidden">{(!data || data.length === 0) ? 'Vacío' : `${data.length} orden${data.length !== 1 ? 'es' : ''}`}</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRefresh();
                }}
                disabled={isRefreshing}
                className="p-1 rounded-lg bg-white bg-opacity-20 hover:bg-opacity-30 transition-all disabled:opacity-50 lg:mt-2"
                aria-label="Actualizar"
              >
                <ArrowPathIcon className={`h-4 w-4 text-white ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <div className="lg:hidden">
              {isOpen ? (
                <ChevronUpIcon className="h-4 w-4 text-white" />
              ) : (
                <ChevronDownIcon className="h-4 w-4 text-white" />
              )}
            </div>
          </div>
        ) : (
          // Vista expandida - Normal
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1">
              <div className="bg-white bg-opacity-20 rounded-lg p-2">
                <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h2 className="text-sm font-bold text-white">Órdenes Listas</h2>
                {(readyOrdersCount > 0 || deliveredOrdersCount > 0) && (
                  <p className="text-xs text-green-100">
                    {readyOrdersCount > 0 && `${readyOrdersCount} lista${readyOrdersCount !== 1 ? 's' : ''}`}
                    {readyOrdersCount > 0 && deliveredOrdersCount > 0 && ' • '}
                    {deliveredOrdersCount > 0 && `${deliveredOrdersCount} entregada${deliveredOrdersCount !== 1 ? 's' : ''}`}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleRefresh();
                }}
                disabled={isRefreshing}
                className="p-1 rounded-lg bg-white bg-opacity-20 hover:bg-opacity-30 transition-all disabled:opacity-50"
                aria-label="Actualizar"
              >
                <ArrowPathIcon className={`h-4 w-4 text-white ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
              <div className="lg:hidden">
                {isOpen ? (
                  <ChevronUpIcon className="h-4 w-4 text-white" />
                ) : (
                  <ChevronDownIcon className="h-4 w-4 text-white" />
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Contenido - Se oculta cuando está colapsado en desktop */}
      <div className={`${isOpen ? 'block' : 'hidden'} ${!isExpanded ? 'lg:hidden' : 'lg:block'}`}>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-6 px-3 lg:hidden">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-500 border-t-transparent"></div>
            <p className="text-xs text-gray-500 mt-2">Cargando...</p>
          </div>
        ) : error ? (
          <div className="mx-3 my-2 p-3 bg-red-50 border border-red-200 rounded-lg text-center lg:hidden">
            <p className="text-red-600 text-xs font-medium">Error al cargar</p>
          </div>
        ) : !data || data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 px-3 lg:hidden">
            <div className="bg-gray-100 rounded-xl p-4 mb-3">
              <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-sm text-gray-500 font-medium">Sin órdenes</p>
            <p className="text-xs text-gray-400 mt-1">No hay órdenes listas</p>
          </div>
        ) : (
          <div className="p-3 space-y-2">
            {data.map((order) => {
              const isDelivered = !!order.orderDeliveredAt;
              return (
                <div
                  key={order.id}
                  onClick={() => handleOrderClick(order.id, isDelivered)}
                  className={`rounded-xl p-2.5 border-2 cursor-pointer transition-all hover:shadow-lg ${
                    isDelivered
                      ? 'bg-blue-50 border-blue-300 hover:border-blue-400'
                      : 'bg-white border-green-300 hover:border-green-400'
                  }`}
                >
                  {/* Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm ${isDelivered ? 'bg-blue-500' : 'bg-green-500'}`}>
                        {order.name}
                      </div>
                      <span className="text-sm font-bold text-gray-900">Mesa {order.name}</span>
                    </div>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${isDelivered ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>
                      {isDelivered ? 'Entregada' : 'Lista'}
                    </span>
                  </div>

                  {/* Items */}
                  <div className="space-y-1 mb-2">
                    {order.orderProducts.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1.5 flex-1 min-w-0">
                          <span className={`w-5 h-5 rounded flex items-center justify-center text-xs font-bold flex-shrink-0 ${isDelivered ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>
                            {item.quantity}
                          </span>
                          <span className="text-gray-700 truncate">{item.product.name}</span>
                        </div>
                        <span className="text-gray-600 font-medium ml-1">{formatCurrency(item.product.price * item.quantity)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div className="pt-2 border-t border-gray-200 flex justify-between items-center">
                    <span className="text-xs font-bold text-gray-700">Total</span>
                    <span className={`text-base font-bold ${isDelivered ? 'text-blue-600' : 'text-green-600'}`}>{formatCurrency(order.total)}</span>
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
