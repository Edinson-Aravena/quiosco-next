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

  // Maneja el envío del formulario y la validación de datos
  const handleCreateOrder = async (formData: FormData) => {
    // Extrae el nombre del cliente del formulario
    const data = {
      name: formData.get('name'),
      total,
      order
    }

    // Valida los datos del formulario usando Zod Schema
    const result = OrderSchema.safeParse(data)
    console.log(result);
    // Si hay errores de validación, muestra los mensajes de error
    if(!result.success) {
      result.error.issues.forEach((issue) => {
        toast.error(issue.message)
      })

    }


    // Si la validación es exitosa, crea la orden
    const response = await createOrder(data)
    if(response?.errors) {
      response.errors.forEach((issue) => {
        toast.error(issue.message);})
    }


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
    // Aside que contiene el resumen del pedido, con estilos responsivos
    <aside className="w-full lg:w-64 xl:w-72 2xl:w-80 lg:h-screen lg:overflow-y-scroll bg-gradient-to-b from-amber-50 to-white lg:border-l border-gray-200 shadow-md lg:shadow-none">
      {/* Header con título mejorado - Clickeable en móvil */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-3 sm:p-4 lg:p-4 lg:sticky lg:top-0 bg-gradient-to-b from-amber-50 to-transparent z-10 hover:bg-amber-100 lg:hover:bg-transparent transition-colors border-b lg:border-b-0 border-amber-200 cursor-pointer lg:cursor-auto"
      >
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-1 justify-center lg:justify-center">
            <ShoppingCartIcon className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7 lg:h-8 lg:w-8 text-amber-600" />
            <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl text-center font-black text-gray-800">
              Mi Pedido
            </h1>
          </div>
          {/* Icono de chevron solo visible en móvil */}
          <div className="lg:hidden">
            {isOpen ? (
              <ChevronUpIcon className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
            ) : (
              <ChevronDownIcon className="h-5 w-5 sm:h-6 sm:w-6 text-amber-600" />
            )}
          </div>
        </div>
        <div className="flex items-center justify-center">
          <div className="h-0.5 sm:h-1 w-16 sm:w-20 bg-amber-500 rounded-full"></div>
        </div>
        {/* Badge con contador de productos y total */}
        {order.length > 0 && (
          <div className="mt-2 sm:mt-3 text-center">
            <span className="inline-block bg-amber-100 text-amber-800 px-2 sm:px-3 md:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-semibold">
              {order.length} {order.length === 1 ? 'producto' : 'productos'} • {formatCurrency(total)}
            </span>
          </div>
        )}
      </div>

      {/* Contenido del acordeón - Oculto en móvil cuando isOpen es false */}
      <div className={`${isOpen ? 'block' : 'hidden'} lg:block p-3 sm:p-4 lg:p-4 pt-0`}>

      {/* Si el pedido está vacío, muestra un mensaje */}
      {order.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="bg-gray-100 rounded-full p-6 mb-4">
            <ShoppingCartIcon className="h-20 w-20 text-gray-300" />
          </div>
          <p className="text-center text-gray-500 font-medium text-lg">
            El carrito está vacío
          </p>
          <p className="text-center text-gray-400 text-sm mt-2">
            Agrega productos para comenzar tu pedido
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Mapea cada producto del pedido y muestra sus detalles */}
          {order.map(item => (
            <ProductsDetails
              key={item.id}
              item={item}
            />
          ))}

          {/* Card del total a pagar */}
          <div className="mt-6 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 shadow-lg">
            <div className="flex items-center justify-between text-white">
              <div>
                <p className="text-sm font-medium opacity-90 mb-1">
                  Total a pagar
                </p>
                <p className="text-4xl font-black">
                  {formatCurrency(total)}
                </p>
              </div>
              <div className="bg-white bg-opacity-20 rounded-full p-3">
                <svg
                  className="w-10 h-10 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Formulario para confirmar el pedido */}
          <form
            className="w-full mt-6 space-y-4"
            action={handleCreateOrder}
          >
            {/* Input mejorado */}
            <div className="relative">
              <label
                htmlFor="mesa"
                className="block text-sm font-semibold text-gray-700 mb-2"
              >
                Número de Mesa
              </label>
              <input
                id="mesa"
                type="text"
                placeholder="Ej: 5"
                className="bg-white border-2 border-amber-200 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 rounded-xl p-4 w-full text-lg font-semibold text-gray-800 transition-all duration-200 outline-none"
                name="name"
                pattern="[0-9]*"
                onKeyDown={(e) => {
                  if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab' && e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') {
                    e.preventDefault();
                    if (alertCount < 3) {
                      toast.error('Solo se permiten números');
                      setAlertCount(prev => prev + 1);
                      if (alertCount === 2) {
                        resetAlertCount();
                      }
                    }
                  }
                }}
              />
            </div>

            {/* Botón mejorado */}
            <button
              type="submit"
              className="group relative w-full py-4 px-6 rounded-xl font-bold text-lg text-white bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 overflow-hidden"
            >
              {/* Efecto de brillo */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent.opacity-0 group-hover:opacity-20 transform -skew-x-12 group-hover:translate-x-full transition-all duration-700"></div>

              <div className="relative flex items-center justify-center gap-2">
                <CheckCircleIcon className="h-6 w-6" />
                <span className="uppercase tracking-wide">Confirmar Pedido</span>
              </div>
            </button>

            {/* Texto informativo */}
            <p className="text-center text-xs text-gray-500 mt-2">
              Tu pedido será enviado a la cocina inmediatamente
            </p>
          </form>
        </div>
      )}
      </div>
    </aside>
  );
};

// Exporta el componente para ser utilizado en otras partes de la aplicación
export default OrderSummary;
