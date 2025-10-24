"use server";

import { prisma } from "@/src/lib/prisma";
import { revalidatePath } from "next/cache";

export async function startOrderAction(orderId: number) {
  try {
    await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        orderInProgressAt: new Date(),
      },
    });

    revalidatePath("/admin/orders/api");
    
    return { success: true };
  } catch (error) {
    console.error("Error al iniciar la orden:", error);
    return { success: false, error: "Error al iniciar la orden" };
  }
}
