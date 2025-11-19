"use client";

// Importa el estado global de la orden
import { useStore } from "@/src/store"
// Componente para mostrar los detalles de cada producto en el pedido
import ProductsDetails from "./ProductsDetails";
// Hook para memorizar el cálculo del total y evitar cálculos innecesarios
import { useMemo, useState } from "react";
// Función para formatear el total como moneda
import { formatCurrency } from '../../src/utils/index';
// Acción para crear la orden (enviar el pedido)
import { createOrder } from "@/actions/create-order-action";
// Importación de los tipos y utilidades para validación del formulario
import { OrderSchema } from "@/src/schema";
// Importación para mostrar notificaciones toast
import { toast } from "react-toastify";
import { ShoppingCartIcon, CheckCircleIcon, ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

// Componente que muestra el resumen del pedido y el formulario de confirmación
const OrderSummary = () => {
  // Obtiene el array de productos en el pedido desde el estado global
  const order = useStore((state) => state.order);

  const clearOrder = useStore((state) => state.clearOrder);

  // Calcula el total a pagar sumando el precio por cantidad de cada producto
  const total = useMemo(() => order.reduce((total, item) => total + (item.quantity * item.price), 0), [order]);

  // Agregar un contador de alertas
  const [alertCount, setAlertCount] = useState(0);

  // Estado para controlar si el acordeón está abierto (solo en móvil)
  const [isOpen, setIsOpen] = useState(false);
  
  // Estado para expandir/colapsar en desktop
  const [isExpanded, setIsExpanded] = useState(true);

  // Maneja el envío del formulario y la validación de datos
  const handleCreateOrder = async (formData: FormData) => {
    // Extrae el nombre del cliente del formulario
    console.log('Order from store:', order);
    
    const data = {
      name: formData.get('name'),
      total,
      anotaciones: formData.get('anotaciones') || undefined,
      order: order.map(item => ({
        id: typeof item.id === 'bigint' ? Number(item.id) : Number(item.id),
        name: String(item.name),
        price: typeof item.price === 'object' ? Number(item.price) : Number(item.price),
        quantity: Number(item.quantity),
        subtotal: typeof item.subtotal === 'object' ? Number(item.subtotal) : Number(item.subtotal)
      }))
    }
    
    console.log('Data to validate:', data);

    // Valida los datos del formulario usando Zod Schema
    const result = OrderSchema.safeParse(data)
    console.log('Validation result:', result);
    
    // Si hay errores de validación, muestra los mensajes de error
    if(!result.success) {
      result.error.issues.forEach((issue) => {
        toast.error(issue.message)
      })
      return; // Detener la ejecución si hay errores
    }

    // Si la validación es exitosa, crea la orden
    const response = await createOrder(data)
    
    if(response?.errors) {
      response.errors.forEach((issue) => {
        toast.error(issue.message);
      })
      return; // Detener si hay errores del servidor
    }

    // Solo mostrar éxito si todo salió bien
    toast.success('Pedido Realizado Correctamente');
    clearOrder();
  }

  // Resetear el contador después de 5 segundos
  const resetAlertCount = () => {
    setTimeout(() => {
      setAlertCount(0);
    }, 5000);
  };

  return (
    // Aside que se compacta cuando está vacío o colapsado
    <aside className={`w-full transition-all duration-300 lg:h-screen lg:overflow-y-scroll bg-white lg:border-l border-gray-200 shadow-sm ${
      (order.length === 0 || !isExpanded) ? 'lg:w-16' : 'lg:w-64 xl:w-72 2xl:w-80'
    }`}>
      {/* Header moderno y compacto */}
      <div
        onClick={() => {
          setIsOpen(!isOpen); // Toggle para móvil
          setIsExpanded(!isExpanded); // Toggle para desktop
        }}
        className={`w-full lg:sticky lg:top-0 bg-gradient-to-r from-amber-500 to-orange-500 cursor-pointer transition-all shadow-sm ${
          (order.length === 0 || !isExpanded) ? 'lg:py-4 lg:px-2' : 'p-3'
        }`}
      >
        {(order.length === 0 || !isExpanded) ? (
          // Vista compactada - Solo icono vertical en desktop
          <div className="flex lg:flex-col items-center justify-between lg:justify-center gap-2">
            <div className="flex items-center gap-2 lg:flex-col">
              <div className="bg-white bg-opacity-20 rounded-lg p-2">
                <ShoppingCartIcon className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-sm font-bold text-white lg:hidden">Mi Pedido</h1>
              <p className="text-xs text-amber-100 lg:hidden">{order.length === 0 ? 'Vacío' : `${order.length} item${order.length !== 1 ? 's' : ''}`}</p>
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
            <div className="flex items-center gap-2">
              <div className="bg-white bg-opacity-20 rounded-lg p-2">
                <ShoppingCartIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white">Mi Pedido</h2>
                <p className="text-xs text-amber-100">{order.length} items • {formatCurrency(total)}</p>
              </div>
            </div>
            <div className="lg:hidden">
              {isOpen ? (
                <ChevronUpIcon className="h-4 w-4 text-white" />
              ) : (
                <ChevronDownIcon className="h-4 w-4 text-white" />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Contenido - Se oculta cuando está colapsado en desktop */}
      <div className={`${isOpen ? 'block' : 'hidden'} ${!isExpanded ? 'lg:hidden' : 'lg:block'}`}>

      {/* Si el pedido está vacío, muestra un mensaje en móvil */}
      {order.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-6 px-3 lg:hidden">
          <div className="bg-gray-100 rounded-xl p-4 mb-3">
            <ShoppingCartIcon className="h-10 w-10 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500 font-medium">Carrito vacío</p>
          <p className="text-xs text-gray-400 mt-1">Agrega productos</p>
        </div>
      ) : (
        <div className="p-3 space-y-3">
          {/* Lista de productos moderna */}
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1 scrollbar-hide">
            {order.map(item => (
              <ProductsDetails
                key={item.id}
                item={item}
              />
            ))}
          </div>

          {/* Total moderno */}
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-3 shadow-lg">
            <div className="flex items-center justify-between text-white">
              <div>
                <p className="text-xs opacity-75 mb-0.5">Total a pagar</p>
                <p className="text-2xl font-bold">{formatCurrency(total)}</p>
              </div>
              <div className="bg-amber-500 rounded-lg p-2">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Formulario moderno */}
          <form className="space-y-2" action={handleCreateOrder}>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Número de Mesa
              </label>
              <input
                id="mesa"
                type="text"
                placeholder="Ej: 5"
                className="bg-gray-50 border-2 border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 rounded-lg p-2.5 w-full text-sm font-semibold text-gray-900 transition-all outline-none"
                name="name"
                pattern="[0-9]*"
                onKeyDown={(e) => {
                  if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') {
                    e.preventDefault();
                    if (alertCount < 3) {
                      toast.error('Solo números');
                      setAlertCount(prev => prev + 1);
                      if (alertCount === 2) {
                        resetAlertCount();
                      }
                    }
                  }
                }}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Anotaciones (Opcional)
              </label>
              <textarea
                id="anotaciones"
                name="anotaciones"
                placeholder="Ej: Churrasco sin mayonesa, arroz sin pimentón..."
                rows={3}
                className="bg-gray-50 border-2 border-gray-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 rounded-lg p-2.5 w-full text-sm text-gray-900 transition-all outline-none resize-none"
              />
            </div>

            <button
              type="submit"
              className="group relative w-full py-2.5 rounded-lg font-bold text-sm text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all overflow-hidden"
            >
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <div className="relative flex items-center justify-center gap-2">
                <CheckCircleIcon className="h-4 w-4" />
                <span>CONFIRMAR PEDIDO</span>
              </div>
            </button>
          </form>
        </div>
      )}
      </div>
    </aside>
  );
};

// Exporta el componente para ser utilizado en otras partes de la aplicación
export default OrderSummary;
