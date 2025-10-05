 // Importación de componentes necesarios para el layout
import OrderSidebar from "@/components/order/OrderSidebar";  // Barra lateral con categorías
import OrderSummary from "@/components/order/OrderSummary";  // Resumen del pedido
import ReadyOrdersSidebar from "@/components/order/ReadyOrdersSidebar";  // Sidebar de órdenes listas
import ToastNotification from "@/components/ui/ToastNotification";  // Componente para notificaciones

// Componente de layout principal para la sección de pedidos
export default function RootLayout({
    children,  // Contenido que se renderizará dentro del layout
}: Readonly<{
    children: React.ReactNode;  // Tipo para children que asegura que sea contenido válido de React
}>) {
    return (
        <>
            {/* Contenedor principal con diseño responsive */}
            <div className="flex flex-col lg:flex-row">
                {/* Barra lateral izquierda con categorías - Responsiva */}
                <div className="order-1 lg:order-1">
                    <OrderSidebar />
                </div>

                {/* Sidebars superiores en móvil - Aparecen ANTES del contenido */}
                <div className="order-2 lg:order-3 flex flex-col lg:flex-row">
                    {/* Barra lateral con el resumen del pedido */}
                    <OrderSummary />

                    {/* Sidebar de órdenes listas */}
                    <ReadyOrdersSidebar />
                </div>

                {/* Contenido principal - Aparece DESPUÉS de los sidebars en móvil */}
                <main className="order-3 lg:order-2 flex-1 lg:h-screen lg:overflow-y-scroll p-3 sm:p-5">
                    {children}
                </main>
            </div>

            {/* Componente para mostrar notificaciones toast */}
            <ToastNotification />
        </>
    )
}