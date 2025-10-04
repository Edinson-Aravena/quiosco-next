import { MinusIcon, PlusIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { OrderItem } from "@/src/types"
import { formatCurrency } from "@/src/utils";
import { useStore } from "@/src/store";
import { useMemo } from "react";


type ProductDetailsProps = {
    item: OrderItem
}

const MIN_ITEMS = 1
const MAX_ITEMS = 10

export default function ProductsDetails({ item }: ProductDetailsProps) {

    const increaseQuantity = useStore((state) => state.increaseQuantity);
    const decreaseQuantity = useStore((state) => state.decreaseQuantity);
    const removeItem = useStore((state) => state.removeItem);
    const disableDrecreaseButton = useMemo(() => item.quantity === MIN_ITEMS, [item])
    const disableincreaseButton = useMemo(() => item.quantity === MAX_ITEMS, [item])

    return (
        <div className="bg-white border-2 border-amber-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-all duration-200 hover:border-amber-300 relative overflow-hidden">
            {/* Decoración de fondo */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-50 to-transparent rounded-full -mr-16 -mt-16 opacity-50"></div>

            <div className="relative space-y-3">
                {/* Header con nombre y botón eliminar */}
                <div className="flex justify-between items-start gap-3">
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-800 leading-tight">
                            {item.name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                            Precio unitario
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="flex-shrink-0 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-full p-1 transition-all duration-200 hover:scale-110"
                        aria-label="Eliminar producto"
                    >
                        <XCircleIcon className="h-7 w-7" />
                    </button>
                </div>

                {/* Precio unitario */}
                <div className="flex items-center gap-2">
                    <span className="text-2xl font-black text-amber-600">
                        {formatCurrency(item.price)}
                    </span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        c/u
                    </span>
                </div>

                {/* Divisor */}
                <div className="border-t border-amber-100"></div>

                {/* Controles de cantidad */}
                <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">
                        Cantidad:
                    </span>
                    <div className="flex items-center gap-3 bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-2 rounded-full border border-amber-200">
                        <button
                            type="button"
                            onClick={() => decreaseQuantity(item.id)}
                            disabled={disableDrecreaseButton}
                            className="disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white rounded-full p-1 transition-all duration-200 hover:scale-110 active:scale-95"
                            aria-label="Disminuir cantidad"
                        >
                            <MinusIcon className="h-5 w-5 text-amber-700" />
                        </button>

                        <span className="text-lg font-black text-amber-900 min-w-[2rem] text-center">
                            {item.quantity}
                        </span>

                        <button
                            type="button"
                            onClick={() => increaseQuantity(item.id)}
                            className="disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white rounded-full p-1 transition-all duration-200 hover:scale-110 active:scale-95"
                            disabled={disableincreaseButton}
                            aria-label="Aumentar cantidad"
                        >
                            <PlusIcon className="h-5 w-5 text-amber-700" />
                        </button>
                    </div>
                </div>

                {/* Divisor */}
                <div className="border-t border-amber-100"></div>

                {/* Subtotal */}
                <div className="flex justify-between items-center bg-gradient-to-r from-amber-50 to-orange-50 -mx-4 -mb-4 px-4 py-3 rounded-b-xl border-t-2 border-amber-200">
                    <span className="text-sm font-bold text-gray-700">
                        Subtotal:
                    </span>
                    <span className="text-xl font-black text-amber-700">
                        {formatCurrency(item.subtotal)}
                    </span>
                </div>
            </div>
        </div>
    )
}
