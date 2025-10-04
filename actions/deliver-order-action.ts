"use server";

import { prisma } from "@/src/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deliverOrderAction(orderId: number) {
  try {
    // Actualiza la orden para marcar que fue entregada
    await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        orderDeliveredAt: new Date(),
      },
    });

    revalidatePath("/orders/api");
    
    return { success: true };
  } catch (error) {
    console.error("Error al entregar la orden:", error);
    return { success: false, error: "Error al entregar la orden" };
  }
}
