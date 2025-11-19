import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Heading from "@/components/ui/Heading";
import AssistantChat from "@/components/admin/AssistantChat";

async function checkAuth() {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get('user');
  
  if (!userCookie) {
    redirect('/');
  }

  const user = JSON.parse(userCookie.value);
  
  if (user.role !== 'ADMIN') {
    redirect('/');
  }

  return user;
}

export default async function AssistantPage() {
  const user = await checkAuth();

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center gap-4 mb-2">
          <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center text-3xl shadow-lg">
            🤖
          </div>
          <div>
            <Heading>Asistente de Inteligencia de Negocio</Heading>
            <p className="text-gray-600 mt-1">Analiza tus datos de ventas y obtén insights accionables con IA</p>
          </div>
        </div>
      </div>

      <AssistantChat userName={user.name || user.username} />
    </div>
  );
}
