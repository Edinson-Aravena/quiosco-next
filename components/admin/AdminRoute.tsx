"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"


type AdminRouteProps = {
    link:{
        url: string;
        text: string;
        blank: boolean;
    }
}


export default function AdminRoute({link}: AdminRouteProps) {
    const pathname = usePathname();
    // Verifica si la ruta actual incluye la url del link y comienza con /admin
    const isActive = pathname === link.url || pathname.startsWith(link.url + '/');
    return (
        <Link
            className={`font-bold text-lg border-t border-gray-200 p-3 last-of-type:border-b ${isActive ? 'bg-amber-400' : ''}`}
            href={link.url}
            target={link.blank ? '_blank' : undefined}
        >
            {link.text}
        </Link>
    )
}
