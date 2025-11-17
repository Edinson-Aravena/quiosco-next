"use client";

import { ChefOrder } from "@/actions/get-chef-orders-action"
import { startPreparingOrderAction, markOrderReadyAction } from "@/actions/update-chef-order-action"
import { formatCurrency } from "@/src/utils"
import { toast } from "react-toastify"

interface ChefOrderCardProps {
  order: ChefOrder;
  onComplete?: () => Promise<void>;
}

export default function ChefOrderCard({ order, onComplete }: ChefOrderCardProps) {
  const isInProgress = order.prepStatus === 'IN_PROGRESS';
  
  const handleOrderClick = async () => {
    if (!isInProgress) {
      // Primer click: marcar como "En Preparación"
      try {
        const result = await startPreparingOrderAction(order.orderId);
        if (result.success) {
          toast.success("Orden en preparación");
          if (onComplete) await onComplete();
        } else {
          toast.error(result.error || "Error al iniciar la orden");
        }
      } catch (error) {
        toast.error("Error al iniciar la orden");
      }
    } else {
      // Segundo click: marcar como "Lista"
      try {
        const result = await markOrderReadyAction(order.orderId);
        if (result.success) {
          toast.success("Orden completada");
          if (onComplete) await onComplete();
        } else {
          toast.error(result.error || "Error al completar la orden");
        }
      } catch (error) {
        toast.error("Error al completar la orden");
      }
    }
  }

  // Determinar el color y estado según el progreso
  const getStatusConfig = () => {
    if (isInProgress) {
      return {
        gradient: 'from-orange-500 to-orange-600',
        hoverGradient: 'hover:from-orange-600 hover:to-orange-700',
        bgColor: 'from-orange-50 to-orange-100',
        borderColor: 'border-orange-300',
        badgeBg: 'from-orange-500 to-orange-600',
        icon: '👨‍🍳',
        buttonText: 'Marcar como Lista',
        buttonIcon: (
          <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        ),
        statusBadge: 'EN PREPARACIÓN'
      };
    }
    return {
      gradient: 'from-yellow-500 to-yellow-600',
      hoverGradient: 'hover:from-yellow-600 hover:to-yellow-700',
      bgColor: 'from-yellow-50 to-yellow-100',
      borderColor: 'border-yellow-300',
      badgeBg: 'from-yellow-500 to-yellow-600',
      icon: '⏳',
      buttonText: 'Iniciar Preparación',
      buttonIcon: (
        <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      statusBadge: 'PENDIENTE'
    };
  };

  const statusConfig = getStatusConfig();

  // Icono y badge según el tipo de orden
  const orderTypeConfig = order.orderType === 'DELIVERY' 
    ? { icon: '🏍️', label: 'Delivery', color: 'bg-blue-500' }
    : { icon: '🍽️', label: 'Local', color: 'bg-purple-500' };

  return (
    <section
      aria-labelledby="summary-heading"
      className={`group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border ${statusConfig.borderColor}`}
    >
      {/* Header decorativo */}
      <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${statusConfig.badgeBg}`}></div>

      {/* Badge de orden y estado */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
        <div className={`${orderTypeConfig.color} text-white px-3 py-1 rounded-full text-xs font-bold shadow-md flex items-center gap-1`}>
          <span>{orderTypeConfig.icon}</span>
          <span>{orderTypeConfig.label}</span>
        </div>
        <div className={`bg-gradient-to-r ${statusConfig.badgeBg} text-white px-3 py-1 rounded-full text-xs font-bold shadow-md`}>
          {order.orderId}
        </div>
        <div className={`bg-gradient-to-r ${statusConfig.bgColor} text-gray-800 px-3 py-1 rounded-full text-xs font-bold shadow-sm border ${statusConfig.borderColor}`}>
          {statusConfig.statusBadge}
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Cliente */}
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-2xl">
            👤
          </div>
          <div className="flex-1">
            <p className="text-xs text-gray-500 font-semibold">Cliente</p>
            <p className="text-lg font-bold text-gray-900">{order.customerName}</p>
            {order.address && (
              <p className="text-xs text-gray-600 mt-1">📍 {order.address}</p>
            )}
          </div>
        </div>

        {/* Productos */}
        <div className="space-y-3 pt-3 border-t border-gray-200">
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Productos</p>
          <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
            {order.products.map((product, index) => (
              <div 
                key={index}
                className="bg-gradient-to-r from-gray-50 to-white p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900 text-sm">{product.productName}</p>
                    <p className="text-xs text-gray-600 flex items-center gap-2 mt-1">
                      <span className="bg-gray-200 px-2 py-0.5 rounded-full font-semibold">
                        {product.quantity}x
                      </span>
                      <span>{formatCurrency(product.price)}</span>
                    </p>
                  </div>
                  <p className="font-bold text-gray-900 text-sm">
                    {formatCurrency(product.subtotal)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Total y Botón */}
        <div className="space-y-3 pt-4 border-t-2 border-dashed border-gray-300">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-gray-700">Total</span>
            <span className="text-2xl font-black text-gray-900">
              {formatCurrency(order.total)}
            </span>
          </div>

          <button
            onClick={handleOrderClick}
            className={`w-full group/btn bg-gradient-to-r ${statusConfig.gradient} ${statusConfig.hoverGradient} text-white font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-3`}
          >
            {statusConfig.buttonIcon}
            <span className="text-base">{statusConfig.buttonText}</span>
          </button>

          {/* Hora de inicio si está en progreso */}
          {order.startedAt && (
            <div className="text-xs text-gray-500 text-center pt-2">
              Iniciado: {new Date(order.startedAt).toLocaleTimeString('es-ES')}
            </div>
          )}
        </div>
      </div>

      {/* Animación de brillo */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 group-hover:animate-shimmer pointer-events-none"></div>
    </section>
  )
}
