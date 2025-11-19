import { NextRequest, NextResponse } from "next/server";
import * as XLSX from 'xlsx';
import { 
  getTopSellingProducts, 
  getTopSellingCategories, 
  getSalesStats,
  getSalesByDayOfWeek 
} from "@/src/lib/chatbot-helpers";
import { prisma } from "@/src/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const reportType = searchParams.get('type') || 'sales';
    const days = Number(searchParams.get('days')) || 30;

    let workbook: XLSX.WorkBook;

    switch (reportType) {
      case 'products':
        workbook = await generateProductsReport(days);
        break;
      case 'categories':
        workbook = await generateCategoriesReport(days);
        break;
      case 'sales':
      default:
        workbook = await generateSalesReport(days);
        break;
    }

    // Convertir a buffer
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="reporte_${reportType}_${days}dias.xlsx"`
      }
    });

  } catch (error) {
    console.error('Error generating report:', error);
    return NextResponse.json(
      { error: 'Error al generar el reporte' },
      { status: 500 }
    );
  }
}

async function generateSalesReport(days: number) {
  const [stats, dayStats, topProducts] = await Promise.all([
    getSalesStats(days),
    getSalesByDayOfWeek(days),
    getTopSellingProducts(10, days)
  ]);

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  // Obtener todas las órdenes detalladas
  const quioscoOrders = await prisma.order.findMany({
    where: {
      date: { gte: startDate },
      orderDeliveredAt: { not: null }
    },
    include: {
      orderProducts: {
        include: {
          product: {
            include: {
              category: true
            }
          }
        }
      }
    },
    orderBy: { date: 'desc' }
  });

  const deliveryOrders = await prisma.deliveryOrder.findMany({
    where: {
      createdAt: { gte: startDate },
      status: 'ENTREGADO'
    },
    include: {
      client: true,
      address: true,
      orderProducts: {
        include: {
          product: {
            include: {
              category: true
            }
          }
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  const workbook = XLSX.utils.book_new();

  // Hoja 1: Resumen General
  const summaryData = [
    ['REPORTE DE VENTAS - LAS ARAUCARIAS'],
    [`Período: Últimos ${days} días (${startDate.toLocaleDateString('es-ES')} - ${new Date().toLocaleDateString('es-ES')})`],
    [],
    ['RESUMEN GENERAL'],
    ['Total de Órdenes', stats.totalOrders],
    ['Ingresos Totales', `$${stats.totalRevenue.toFixed(2)}`],
    ['Valor Promedio por Orden', `$${stats.averageOrderValue.toFixed(2)}`],
    [],
    ['ÓRDENES LOCALES'],
    ['Cantidad', stats.quioscoOrders],
    ['Ingresos', `$${stats.quioscoRevenue.toFixed(2)}`],
    [],
    ['ÓRDENES DELIVERY'],
    ['Cantidad', stats.deliveryOrders],
    ['Ingresos', `$${stats.deliveryRevenue.toFixed(2)}`],
  ];
  const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumen');

  // Hoja 2: Ventas por Día de la Semana
  const dayData = [
    ['DÍA', 'ÓRDENES', 'INGRESOS', 'PROMEDIO POR ORDEN'],
    ...dayStats.map(d => [
      d.day,
      d.orders,
      `$${d.revenue.toFixed(2)}`,
      `$${d.averageOrderValue.toFixed(2)}`
    ])
  ];
  const daySheet = XLSX.utils.aoa_to_sheet(dayData);
  XLSX.utils.book_append_sheet(workbook, daySheet, 'Ventas por Día');

  // Hoja 3: Productos Top
  const productsData = [
    ['PRODUCTO', 'CATEGORÍA', 'CANTIDAD VENDIDA', 'PRECIO UNITARIO', 'INGRESOS TOTALES'],
    ...topProducts.map(p => [
      p.name,
      p.category,
      p.totalSold,
      `$${p.price.toFixed(2)}`,
      `$${(p.totalSold * p.price).toFixed(2)}`
    ])
  ];
  const productsSheet = XLSX.utils.aoa_to_sheet(productsData);
  XLSX.utils.book_append_sheet(workbook, productsSheet, 'Productos Top');

  // Hoja 4: Detalle de Órdenes Locales
  const quioscoData = [
    ['ID ORDEN', 'MESA', 'FECHA', 'HORA', 'PRODUCTOS', 'TOTAL'],
    ...quioscoOrders.map(order => [
      order.id,
      order.name,
      new Date(order.date).toLocaleDateString('es-ES'),
      new Date(order.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      order.orderProducts.map(op => `${op.quantity}x ${op.product.name}`).join(', '),
      `$${order.total.toFixed(2)}`
    ])
  ];
  const quioscoSheet = XLSX.utils.aoa_to_sheet(quioscoData);
  XLSX.utils.book_append_sheet(workbook, quioscoSheet, 'Órdenes Locales');

  // Hoja 5: Detalle de Órdenes Delivery
  const deliveryData = [
    ['ID ORDEN', 'CLIENTE', 'DIRECCIÓN', 'FECHA', 'HORA', 'PRODUCTOS', 'TOTAL'],
    ...deliveryOrders.map(order => {
      const total = order.orderProducts.reduce((sum, op) => 
        sum + (Number(op.quantity) * Number(op.product.price)), 0
      );
      return [
        order.id,
        order.client.name,
        `${order.address.address}, ${order.address.neighborhood}`,
        new Date(Number(order.timestamp)).toLocaleDateString('es-ES'),
        new Date(Number(order.timestamp)).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        order.orderProducts.map(op => `${op.quantity}x ${op.product.name}`).join(', '),
        `$${total.toFixed(2)}`
      ];
    })
  ];
  const deliverySheet = XLSX.utils.aoa_to_sheet(deliveryData);
  XLSX.utils.book_append_sheet(workbook, deliverySheet, 'Órdenes Delivery');

  return workbook;
}

async function generateProductsReport(days: number) {
  const products = await getTopSellingProducts(50, days);
  
  const workbook = XLSX.utils.book_new();

  const data = [
    ['REPORTE DE PRODUCTOS MÁS VENDIDOS - LAS ARAUCARIAS'],
    [`Período: Últimos ${days} días`],
    [],
    ['PRODUCTO', 'CATEGORÍA', 'CANTIDAD VENDIDA', 'PRECIO UNITARIO', 'INGRESOS TOTALES'],
    ...products.map(p => [
      p.name,
      p.category,
      p.totalSold,
      `$${p.price.toFixed(2)}`,
      `$${(p.totalSold * p.price).toFixed(2)}`
    ])
  ];

  const sheet = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(workbook, sheet, 'Productos');

  return workbook;
}

async function generateCategoriesReport(days: number) {
  const categories = await getTopSellingCategories(days);
  
  const workbook = XLSX.utils.book_new();

  const data = [
    ['REPORTE DE CATEGORÍAS - LAS ARAUCARIAS'],
    [`Período: Últimos ${days} días`],
    [],
    ['CATEGORÍA', 'PRODUCTOS', 'UNIDADES VENDIDAS', 'INGRESOS TOTALES'],
    ...categories.map(c => [
      c.name,
      c.productCount,
      c.totalSold,
      `$${c.totalRevenue.toFixed(2)}`
    ])
  ];

  const sheet = XLSX.utils.aoa_to_sheet(data);
  XLSX.utils.book_append_sheet(workbook, sheet, 'Categorías');

  return workbook;
}
