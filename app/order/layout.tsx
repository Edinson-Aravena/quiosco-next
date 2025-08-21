// Importación de componentes necesarios para el layout
import OrderSidebar from "@/components/order/OrderSidebar";  // Barra lateral con categorías
import OrderSummary from "@/components/order/OrderSummary";  // Resumen del pedido
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
            <div className="md:flex">
                {/* Barra lateral izquierda con categorías */}
                <OrderSidebar />

                {/* Contenido principal con scroll y flex-grow */}
                <main className="md:flex-1 md:h-screen md:overflow-y-scroll p-5">
                    {children}
                </main>

                {/* Barra lateral derecha con el resumen del pedido */}
                <OrderSummary />
            </div>

            {/* Componente para mostrar notificaciones toast */}
            <ToastNotification />
        </>
    )
}