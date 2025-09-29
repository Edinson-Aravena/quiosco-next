"use client"

import { deleteProduct } from "@/actions/delete-product-action"
import { useRouter } from "next/navigation"
import { toast } from "react-toastify"

export default function DeleteProductButton({ id, name }: { id: number, name: string }) {
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
            className="text-red-600 hover:text-red-800 ml-4"
        >Eliminar</button>
    )
}


