"use client";

import { useStore } from "@/src/store";
import { Product } from "@prisma/client";
import { PlusCircleIcon } from "@heroicons/react/24/outline";


type AddProductButtonProps = {
    product: Product
}

export default function AddProductButton({ product }: AddProductButtonProps) {
    const addToOrder = useStore((state) => state.addToOrder);


    return (
        <button
            type="button"
            className="group/btn relative w-full py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl font-bold text-sm sm:text-base text-white bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 overflow-hidden"
            onClick={() => addToOrder(product)}
        >
            {/* Efecto de brillo animado */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover/btn:opacity-20 transform -skew-x-12 group-hover/btn:translate-x-full transition-all duration-700"></div>

            {/* Contenido del botón */}
            <div className="relative flex items-center justify-center gap-1.5 sm:gap-2">
                <PlusCircleIcon className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="uppercase tracking-wide">Agregar al Pedido</span>
            </div>
        </button>
    )
}
