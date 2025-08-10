import OrderSidebar from "@/components/OrderSidebar";
import OrderSummary from "@/components/OrderSummary";


export default function RootLayout({children,}: Readonly<{ children: React.ReactNode;}>) {

    return (
        <>
            <div className="md:flex">
                <OrderSidebar />

                <main className="md:flex-1 md:h-screen md:overflow-y-scroll p-5">
                    {children}
                </main>

                <OrderSummary />


            </div>
        
        </>
    )

}