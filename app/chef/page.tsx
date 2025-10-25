import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/src/lib/prisma";
import Heading from "@/components/ui/Heading";
import Logo from "@/components/ui/Logo";
import { logoutAction } from "@/actions/login-action";
import ChefOrdersList from "@/components/order/ChefOrdersList";

async function getOrders() {
  const orders = await prisma.order.findMany({
    where: {
      status: false,
      orderReadyAT: null
    },
    include: {
      orderProducts: {
        include: {
          product: true
        }
      }
    },
    orderBy: {
      date: 'asc'
    }
  });
  return orders;
}

async function checkAuth() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get('user');
  
  if (!userCookie) {
    redirect('/');
  }

  const user = JSON.parse(userCookie.value);
  
  // Solo permitir acceso a CHEF y ADMIN
  if (user.role !== 'CHEF' && user.role !== 'ADMIN') {
    redirect('/order/cafe');
  }

  return user;
}

export default async function ChefPage() {
  const user = await checkAuth();
  const orders = await getOrders();

  const pendingOrders = orders.filter(order => !order.orderInProgressAt);
  const inProgressOrders = orders.filter(order => order.orderInProgressAt && !order.orderReadyAT);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50">
      {/* Header */}
      <div className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Logo />
              <div className="border-l border-gray-300 pl-4">
                <h1 className="text-2xl font-bold text-gray-900">Panel de Cocina</h1>
                <p className="text-sm text-gray-600">👨‍🍳 {user.name || user.username}</p>
              </div>
            </div>
            <form action={logoutAction}>
              <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-semibold text-sm">
                Cerrar Sesión
              </button>
            </form>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-100 text-sm font-semibold">Pendientes</p>
                <p className="text-4xl font-bold mt-1">{pendingOrders.length}</p>
              </div>
              <div className="text-5xl opacity-80">⏳</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-400 to-red-500 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-semibold">En Preparación</p>
                <p className="text-4xl font-bold mt-1">{inProgressOrders.length}</p>
              </div>
              <div className="text-5xl opacity-80">🔥</div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl p-6 text-white shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm font-semibold">Total Activas</p>
                <p className="text-4xl font-bold mt-1">{orders.length}</p>
              </div>
              <div className="text-5xl opacity-80">📋</div>
            </div>
          </div>
        </div>

        {/* Lista de órdenes */}
        <ChefOrdersList 
          pendingOrders={pendingOrders} 
          inProgressOrders={inProgressOrders}
        />
      </div>
    </div>
  );
}
