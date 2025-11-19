import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { getBusinessSummary } from "@/src/lib/chatbot-helpers";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
});

export async function POST(request: NextRequest) {
  try {
    const { message, days = 30 } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Mensaje inválido' },
        { status: 400 }
      );
    }

    // Obtener datos del negocio
    const businessData = await getBusinessSummary(days);

    // Construir el contexto para Claude
    const contextPrompt = `
Eres un asistente de inteligencia de negocio para un restaurante llamado "Las Araucarias". 
Tienes acceso a los datos de ventas y productos de los últimos ${days} días.

DATOS DEL NEGOCIO:

📊 ESTADÍSTICAS GENERALES:
- Total de órdenes: ${businessData.salesStats.totalOrders}
- Ingresos totales: $${businessData.salesStats.totalRevenue.toFixed(2)}
- Órdenes locales: ${businessData.salesStats.quioscoOrders} ($${businessData.salesStats.quioscoRevenue.toFixed(2)})
- Órdenes delivery: ${businessData.salesStats.deliveryOrders} ($${businessData.salesStats.deliveryRevenue.toFixed(2)})
- Valor promedio por orden: $${businessData.salesStats.averageOrderValue.toFixed(2)}

🔥 PRODUCTOS MÁS VENDIDOS:
${businessData.topProducts.map((p, i) => 
  `${i + 1}. ${p.name} (${p.category}) - ${p.totalSold} unidades vendidas - $${p.price} c/u`
).join('\n')}

📉 PRODUCTOS CON MENOS VENTAS:
${businessData.lowProducts.map((p, i) => 
  `${i + 1}. ${p.name} (${p.category}) - ${p.totalSold} unidades vendidas - $${p.price} c/u`
).join('\n')}

🏷️ CATEGORÍAS MÁS VENDIDAS:
${businessData.topCategories.slice(0, 5).map((c, i) => 
  `${i + 1}. ${c.name} - ${c.totalSold} unidades - $${c.totalRevenue.toFixed(2)} en ingresos`
).join('\n')}

📅 VENTAS POR DÍA DE LA SEMANA:
${businessData.dayStats.map(d => 
  `${d.day}: ${d.orders} órdenes - $${d.revenue.toFixed(2)}`
).join('\n')}

INSTRUCCIONES:
- Responde en español de forma clara y profesional
- Usa los datos proporcionados para dar respuestas precisas
- Si te preguntan sobre abastecimiento, infiere ingredientes basándote en los productos más vendidos
- Proporciona insights accionables y recomendaciones de negocio
- Usa emojis para hacer las respuestas más visuales
- Sé conciso pero completo en tus respuestas
- Si la pregunta no está relacionada con el negocio, redirige al usuario amablemente

GENERACIÓN DE REPORTES:
- Si el usuario solicita un "reporte" o "informe" o menciona "Excel", SIEMPRE menciona que puede descargar un reporte en Excel haciendo clic en el botón que aparecerá debajo de tu respuesta
- Tipos de reportes disponibles: ventas, productos, categorías
- Los reportes incluyen datos detallados de los últimos ${days} días

Ejemplo de inferencia de ingredientes:
- Si "Hamburguesa" es top vendido → recomendar: carne molida, pan, lechuga, tomate, queso
- Si "Pizza" es top vendido → recomendar: masa, queso mozzarella, salsa de tomate, ingredientes varios
- Si bebidas son top → recomendar: reposición de inventario de bebidas específicas
`;

    // Llamar a Claude Haiku
    const response = await anthropic.messages.create({
      model: "claude-3-haiku-20240307",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: contextPrompt + "\n\nPREGUNTA DEL USUARIO:\n" + message
        }
      ],
    });

    const aiResponse = response.content[0].type === 'text' 
      ? response.content[0].text 
      : 'No pude procesar la respuesta';

    return NextResponse.json({
      response: aiResponse,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens
      }
    });

  } catch (error) {
    console.error('Error en chatbot:', error);
    return NextResponse.json(
      { error: 'Error al procesar la consulta' },
      { status: 500 }
    );
  }
}
