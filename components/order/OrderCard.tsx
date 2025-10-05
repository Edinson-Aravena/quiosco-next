import { completeOrder } from "@/actions/complete-order-action"
import { OrderWithProducts } from "@/src/types"
import { formatCurrency } from "@/src/utils"

interface OrderCardProps {
  order: OrderWithProducts;
  onComplete: (orderId: number) => Promise<void>;
}

export default function OrderCard({ order, onComplete }: OrderCardProps) {
  const handleCompleteOrder = async () => {
    try {
      const formData = new FormData();
      formData.append('order_id', order.id.toString());
      await completeOrder(formData);
      await onComplete(order.id);
    } catch (error) {
      console.error('Error al completar la orden:', error);
    }
  }

  return (
    <section
      aria-labelledby="summary-heading"
      className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-amber-300"
    >
      {/* Header decorativo */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500"></div>

      {/* Badge de orden */}
      <div className="absolute top-4 right-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">
        Orden #{order.id}
      </div>

      <div className="p-6 space-y-5">
        {/* Cliente */}
        <div className="flex items-center gap-3 pt-2">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-2xl shadow-md">
            👤
          </div>
          <div>
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Mesa</p>
            <p className="text-xl font-bold text-gray-900">{order.name}</p>
          </div>
        </div>

        {/* Productos */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg">🍽️</span>
            <p className="text-sm font-bold text-gray-700 uppercase tracking-wide">Productos Ordenados</p>
          </div>

          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 space-y-3">
            {order.orderProducts.map(product => (
              <div
                key={product.product.id}
                className="flex items-center gap-3 pb-3 border-b border-gray-200 last:border-b-0 last:pb-0"
              >
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                  {product.quantity}
                </div>
                <p className="flex-1 text-sm font-medium text-gray-800">
                  {product.product.name}
                </p>
                <p className="text-xs text-gray-500 font-semibold">
                  {formatCurrency(product.product.price * product.quantity)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="flex items-center justify-between pt-4 border-t-2 border-dashed border-gray-300">
          <div className="flex items-center gap-2">
            <span className="text-xl">💰</span>
            <p className="text-base font-bold text-gray-700">Total a Pagar</p>
          </div>
          <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-orange-600">
            {formatCurrency(order.total)}
          </p>
        </div>

        {/* Botón */}
        <form action={handleCompleteOrder}>
          <button
            type="submit"
            className="
              w-full mt-2
              bg-gradient-to-r from-green-500 to-emerald-600
              hover:from-green-600 hover:to-emerald-700
              text-white font-bold text-base
              py-4 px-6 rounded-xl
              shadow-lg hover:shadow-xl
              transition-all duration-300
              transform hover:scale-105 hover:-translate-y-0.5
              flex items-center justify-center gap-2
              group
            "
          >
            <svg className="w-5 h-5 transition-transform group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <span>Completar Orden</span>
          </button>
        </form>
      </div>
    </section>
  )
}