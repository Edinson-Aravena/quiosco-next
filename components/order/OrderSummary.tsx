"use client";

// Importa el estado global de la orden
import { useStore } from "@/src/store"
// Componente para mostrar los detalles de cada producto en el pedido
import ProductsDetails from "./ProductsDetails";
// Hook para memorizar el cálculo del total y evitar cálculos innecesarios
import { useMemo } from "react";
// Función para formatear el total como moneda
import { formatCurrency } from '../../src/utils/index';
// Acción para crear la orden (enviar el pedido)
import { createOrder } from "@/actions/create-order-action";
// Importación de los tipos y utilidades para validación del formulario
import { OrderSchema } from "@/src/schema";
// Importación para mostrar notificaciones toast
import { toast } from "react-toastify";
import { clear } from "console";

// Componente que muestra el resumen del pedido y el formulario de confirmación
const OrderSummary = () => {
  // Obtiene el array de productos en el pedido desde el estado global
  const order = useStore((state) => state.order);

  const clearOrder = useStore((state) => state.clearOrder);

  // Calcula el total a pagar sumando el precio por cantidad de cada producto
  const total = useMemo(() => order.reduce((total, item) => total + (item.quantity * item.price), 0), [order]);

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

  return (
    // Aside que contiene el resumen del pedido, con estilos responsivos
    <aside className="lg:h-screen lg:overflow-y-scroll md:w-64 lg:w-96 p-5">
      <h1 className="text-4xl text-center font-black">Mi Pedido</h1>

      {/* Si el pedido está vacío, muestra un mensaje */}
      {order.length === 0 ? (
        <p className="text-center my-10">El carrito esta vacio</p>
      ) : (
        <div className="mt-5">
          {/* Mapea cada producto del pedido y muestra sus detalles */}
          {order.map(item => (
            <ProductsDetails
              key={item.id}
              item={item}
            />
          ))}

          {/* Muestra el total a pagar, formateado como moneda */}
          <p className="text-2xl mt-20 text-center">
            Total a pagar: {''}
            <span className="font-bold">{formatCurrency(total)}</span>
          </p>

          {/* Formulario para confirmar el pedido */}
          <form
            className="w-full mt-10 space-y-5"
            action={handleCreateOrder}
          >
            {/* Campo de entrada para el nombre del cliente */}
            <input 
              type="text" 
              placeholder="Nombre del cliente"
              className="bg-white border border-gray-100 p-2 w-full" // Estilos para el input: fondo blanco, borde gris, padding y ancho completo
              name="name" // Nombre del campo para identificarlo en el formData
            />

            {/* Botón de tipo submit para enviar el formulario */}
            <input
              type="submit"
              className="py-2 rounded uppercase text-white bg-black w-full text-center cursor-pointer font-bold hover:bg-gray-800 transition-colors" // Estilos para el botón: padding, bordes redondeados, texto blanco, fondo negro, ancho completo y efectos hover
              value="Confirmar Pedido" // Texto que se muestra en el botón
              />
          </form>
        </div>
      )}
    </aside>
  );
};

// Exporta el componente para ser utilizado en otras partes de la aplicación
export default OrderSummary;
