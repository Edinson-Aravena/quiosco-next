"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"


type AdminRouteProps = {
    link:{
        url: string;
        text: string;
        blank: boolean;
        icon: string;
    }
}


export default function AdminRoute({link}: AdminRouteProps) {
    const pathname = usePathname();
    
    // Comparación exacta para evitar que rutas hijas activen el padre
    // Por ejemplo, /admin/orders/history no debería activar /admin/orders
    const isActive = pathname === link.url || 
                     (pathname.startsWith(link.url + '/') && link.url !== '/admin/orders');

    return (
        <Link
            className={`
                group relative
                flex items-center gap-3
                px-4 py-3.5
                rounded-xl
                font-semibold text-base
                transition-all duration-300 ease-in-out
                ${isActive
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30 scale-105'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50 hover:scale-105'
                }
            `}
            href={link.url}
            target={link.blank ? '_blank' : undefined}
        >
            {/* Icono */}
            <span className={`
                text-2xl
                transition-transform duration-300
                ${isActive ? 'scale-110' : 'group-hover:scale-110 group-hover:rotate-12'}
            `}>
                {link.icon}
            </span>

            {/* Texto */}
            <span className="flex-1">{link.text}</span>

            {/* Indicador de activo */}
            {isActive && (
                <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span>
            )}

            {/* Indicador de link externo */}
            {link.blank && !isActive && (
                <svg className="w-4 h-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
            )}
        </Link>
    )
}
