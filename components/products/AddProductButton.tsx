"use client";

import { useStore } from "@/src/store";
import { Product } from "@prisma/client";


type AddProductButtonProps = {
    product: Product
}

export default function AddProductButton({ product }: AddProductButtonProps) {
    const addToOrder = useStore((state) => state.addToOrder);


    return (
        <button
            type="button"
            className="bg-indigo-600 hover:bg-indigo-800 text-white uppercase font-bold w-full mt-5 p-3 cursor-pointer"
            onClick={() => addToOrder(product)}
        >Agregar</button>
    )
}
