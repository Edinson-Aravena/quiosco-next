"use server"

import { prisma } from "@/src/lib/prisma"
import { revalidatePath } from "next/cache"

export async function deleteProduct(id: number | bigint) {
    // Convertir a BigInt si es necesario
    const productId = typeof id === 'bigint' ? id : BigInt(id)
    
    if (!id || id <= 0) {
        return {
            errors: [{ message: 'ID de producto inválido' }]
        }
    }

    try {
        // Delete related order items first to satisfy FK constraints
        await prisma.orderProducts.deleteMany({
            where: { productId }
        })

        await prisma.product.delete({
            where: { id: productId }
        })

        revalidatePath('/admin/products')
    } catch (error) {
        console.error(error)
        return {
            errors: [{ message: 'No se pudo eliminar el producto' }]
        }
    }
}


