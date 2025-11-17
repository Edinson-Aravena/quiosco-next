"use client"

import { deleteProduct } from "@/actions/delete-product-action"
import { useRouter } from "next/navigation"
import { toast } from "react-toastify"

export default function DeleteProductButton({ id, name }: { id: number | bigint, name: string }) {
    const router = useRouter()

    const handleDelete = async () => {
        const confirmed = window.confirm(`¿Eliminar "${name}"? Esta acción no se puede deshacer.`)
        if (!confirmed) return

        const response = await deleteProduct(id)
        if (response?.errors) {
            response.errors.forEach((issue: { message: string }) => toast.error(issue.message))
            return
        }

        toast.success('Producto eliminado correctamente')
        router.refresh()
    }

    return (
        <button
            type="button"
            onClick={handleDelete}
            className="
                inline-flex items-center gap-1
                px-3 py-2 rounded-lg
                bg-red-100 hover:bg-red-200
                text-red-700 hover:text-red-900
                text-sm font-semibold
                transition-all duration-200
                transform hover:scale-105
            "
        >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span>Eliminar</span>
        </button>
    )
}


