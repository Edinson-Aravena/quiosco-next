"use server";

import { prisma } from "@/src/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteOrderAction(orderId: number) {
  try {
    // Primero eliminar los productos de la orden
    await prisma.orderProducts.deleteMany({
      where: { orderId: orderId },
    });

    // Luego eliminar la orden
    await prisma.order.delete({
      where: { id: orderId },
    });

    revalidatePath("/orders/api");
    return { success: true };
  } catch (error) {
    console.error("Error al eliminar la orden:", error);
    return { success: false, error: "Error al eliminar la orden" };
  }
}
