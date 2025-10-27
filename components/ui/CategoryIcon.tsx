"use client"
import Image from "next/image"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Category } from "@prisma/client"

type CategoryIconProps = {
    category: Category
}

// Función para obtener el emoji según el slug de la categoría
function getCategoryIcon(slug: string): string {
    const icons: Record<string, string> = {
        'cafe': '☕',
        'desayuno': '🥐',
        'comida': '🍽️',
        'postres': '🍰',
        'bebidas': '🥤',
        'entradas': '🍟'
    }
    return icons[slug] || '🍴'
}

export default function CategoryIcon({ category }: CategoryIconProps) {

    const params = useParams<{category : string}>();
    const isActive = category.slug === params.category;

    return (
        <Link
            href={`/order/${category.slug}`}
            className={`
                group relative
                ${isActive
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg scale-105'
                    : 'bg-white hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 text-gray-700 hover:text-amber-600 shadow-md hover:shadow-lg'
                }
                flex flex-col lg:flex-row items-center gap-2 lg:gap-4
                min-w-[90px] lg:w-full
                border-2 ${isActive ? 'border-amber-400' : 'border-gray-100 hover:border-amber-300'}
                p-3 lg:p-4
                rounded-xl lg:rounded-2xl
                transition-all duration-300 ease-in-out
                transform hover:scale-105 hover:-translate-y-0.5
                cursor-pointer
            `}
        >
            {/* Badge de selección activa */}
            {isActive && (
                <div className="absolute -top-1 -right-1 lg:top-2 lg:right-2 bg-green-500 text-white rounded-full p-1 shadow-md">
                    <svg className="w-3 h-3 lg:w-4 lg:h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                </div>
            )}

            {/* Icono de la categoría */}
            <div className={`
                relative w-12 h-12 lg:w-16 lg:h-16 flex-shrink-0
                rounded-full p-2 lg:p-3
                ${isActive ? 'bg-white/20' : 'bg-gradient-to-br from-amber-100 to-orange-100 group-hover:from-amber-200 group-hover:to-orange-200'}
                transition-all duration-300
                group-hover:rotate-6
                flex items-center justify-center
            `}>
                <span className="text-2xl lg:text-3xl">
                    {getCategoryIcon(category.slug || '')}
                </span>
            </div>

            {/* Nombre de la categoría */}
            <div className="flex-1 text-center lg:text-left">
                <p className={`
                    text-xs lg:text-base font-bold
                    whitespace-nowrap lg:whitespace-normal
                    ${isActive ? 'text-white' : 'text-gray-800 group-hover:text-amber-600'}
                    transition-colors duration-300
                `}>
                    {category.name}
                </p>
                {isActive && (
                    <p className="hidden lg:block text-xs text-white/90 mt-0.5">
                        Seleccionado
                    </p>
                )}
            </div>

            {/* Indicador de flecha en desktop */}
            {isActive && (
                <div className="hidden lg:block">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            )}
        </Link>
    )
}
