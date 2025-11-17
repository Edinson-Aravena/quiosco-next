import { prisma } from "@/src/lib/prisma";
import Heading from "@/components/ui/Heading";
import CreateUserForm from "@/components/admin/CreateUserForm";
import UsersTable from "@/components/admin/UsersTable";

async function getUsers() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      username: true,
      name: true,
      lastname: true,
      phone: true,
      image: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      roles: {
        include: {
          role: true
        }
      },
      addresses: true,
      ordersAsClient: {
        select: {
          id: true
        }
      },
      ordersAsDelivery: {
        select: {
          id: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
  return users;
}

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <Heading>Gestión de Usuarios</Heading>
        <CreateUserForm />
      </div>

      <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-4 border border-indigo-200">
        <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
          <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Roles disponibles
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-700">
          <div className="flex items-start gap-2">
            <span className="font-semibold">🍽️ Garzón:</span>
            <span>Acceso al quiosco para tomar pedidos</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-semibold">👨‍🍳 Chef:</span>
            <span>Ver y gestionar órdenes en la cocina</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-semibold">👑 Administrador:</span>
            <span>Acceso total al sistema</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-semibold">🛵 Repartidor:</span>
            <span>Gestionar entregas de la app móvil</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-semibold">👤 Cliente:</span>
            <span>Usuario de la app móvil</span>
          </div>
        </div>
      </div>

      <div>
        <p className="text-sm text-gray-600 mb-4">
          Total de usuarios: <span className="font-bold text-gray-900">{users.length}</span>
        </p>
        <UsersTable users={users} />
      </div>
    </div>
  );
}
