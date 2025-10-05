import { Product } from "@prisma/client"
import { formatCurrency, getImagePath } from '../../src/utils/index';
import Image from "next/image";
import AddProductButton from "./AddProductButton";

type ProductCardProps = {
    product: Product
}

export default function ProductCard({product}: ProductCardProps) {

    const imagePath = getImagePath(product.image);
  return (
    <div className="group bg-white border-2 border-gray-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:border-amber-300 transition-all duration-300 hover:scale-[1.02]">
        {/* Contenedor de imagen con overlay */}
        <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
            {/* Badge decorativo */}
            <div className="absolute top-2 right-2 sm:top-3 sm:right-3 z-10 bg-white/90 backdrop-blur-sm px-2 py-0.5 sm:px-3 sm:py-1 rounded-full shadow-md">
                <span className="text-[10px] sm:text-xs font-bold text-amber-600">Disponible</span>
            </div>

            {/* Imagen del producto */}
            <div className="relative aspect-[4/5] w-full">
                <Image
                    fill
                    src={imagePath}
                    alt={`Imagen producto ${product.name}`}
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                />
            </div>

            {/* Overlay gradiente en hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>

        {/* Contenido de la card */}
        <div className="p-3 sm:p-5 space-y-3 sm:space-y-4">
            {/* Nombre del producto */}
            <div>
                <h3 className="text-base sm:text-xl font-bold text-gray-800 line-clamp-2 min-h-[2.5rem] sm:min-h-[3.5rem] group-hover:text-amber-700 transition-colors">
                    {product.name}
                </h3>
            </div>

            {/* Divisor decorativo */}
            <div className="h-px bg-gradient-to-r from-transparent via-amber-200 to-transparent"></div>

            {/* Precio */}
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-[10px] sm:text-xs text-gray-500 font-medium mb-1">Precio</p>
                    <p className="text-2xl sm:text-3xl font-black text-amber-600 flex items-start">
                        {formatCurrency(product.price)}
                    </p>
                </div>

                {/* Icono decorativo */}
                <div className="bg-amber-50 rounded-full p-2 sm:p-3">
                    <svg
                        className="w-6 h-6 sm:w-8 sm:h-8 text-amber-500"
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

            {/* Botón de agregar */}
            <AddProductButton
                product={product}
            />
        </div>
    </div>
    )
}
