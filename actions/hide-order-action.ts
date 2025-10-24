"use server";

import { prisma } from "@/src/lib/prisma";
import { revalidatePath } from "next/cache";

export async function hideOrderAction(orderId: number) {
  try {
    // Marcamos la orden con una fecha muy antigua para que se filtre del panel
    // pero permanezca en la base de datos
    const veryOldDate = new Date('2020-01-01');
    
    await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        orderDeliveredAt: veryOldDate,
      },
    });

    revalidatePath("/orders/api");
    
    return { success: true };
  } catch (error) {
    console.error("Error al ocultar la orden:", error);
    return { success: false, error: "Error al ocultar la orden" };
  }
}
