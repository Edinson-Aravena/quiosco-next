import { prisma } from "../src/lib/prisma";

async function fixDeliveryDates() {
  try {
    console.log("Buscando órdenes con fechas incorrectas...");

    // Buscar órdenes entregadas con fechas antiguas (antes de 2024)
    const ordersWithWrongDates = await prisma.order.findMany({
      where: {
        orderDeliveredAt: {
          not: null,
          lt: new Date("2024-01-01"),
        },
      },
      select: {
        id: true,
        name: true,
        date: true,
        orderDeliveredAt: true,
      },
    });

    console.log(`Se encontraron ${ordersWithWrongDates.length} órdenes con fechas incorrectas.`);

    if (ordersWithWrongDates.length === 0) {
      console.log("No hay órdenes para actualizar.");
      return;
    }

    // Actualizar cada orden para que la fecha de entrega sea su fecha de creación + 1 hora
    // (simulando que fueron entregadas poco después de ser creadas)
    for (const order of ordersWithWrongDates) {
      const deliveryDate = new Date(order.date);
      deliveryDate.setHours(deliveryDate.getHours() + 1);

      await prisma.order.update({
        where: { id: order.id },
        data: {
          orderDeliveredAt: deliveryDate,
        },
      });

      console.log(`✓ Orden #${order.id} (${order.name}): ${order.orderDeliveredAt} → ${deliveryDate}`);
    }

    console.log("\n✅ Fechas actualizadas correctamente!");
  } catch (error) {
    console.error("❌ Error al actualizar fechas:", error);
  } finally {
    await prisma.$disconnect();
  }
}

fixDeliveryDates();
