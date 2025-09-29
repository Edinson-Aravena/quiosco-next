"use server"

import { prisma } from "@/src/lib/prisma"
import { revalidatePath } from "next/cache"

export async function deleteProduct(id: number) {
    if (!id || typeof id !== 'number' || Number.isNaN(id) || id <= 0) {
        return {
            errors: [{ message: 'ID de producto inválido' }]
        }
    }

    try {
        // Delete related order items first to satisfy FK constraints
        await prisma.orderProducts.deleteMany({
            where: { productId: id }
        })

        await prisma.product.delete({
            where: { id }
        })

        revalidatePath('/admin/products')
    } catch (error) {
        console.error(error)
        return {
            errors: [{ message: 'No se pudo eliminar el producto' }]
        }
    }
}


