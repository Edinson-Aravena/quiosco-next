import ToastNotification from "@/components/ui/ToastNotification";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <div className="md:flex min-h-screen">
                <aside className="md:w-72 lg:w-80 md:h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-2xl">
                    <AdminSidebar />
                </aside>

                <main className="md:flex-1 md:h-screen md:overflow-y-scroll bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6 lg:p-8">
                    {children}
                </main>
            </div>

            <ToastNotification />
        </>
    )
}