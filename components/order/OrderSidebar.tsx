import {prisma} from "@/src/lib/prisma";
import CategoryIcon from "../ui/CategoryIcon";
import Logo from "../ui/Logo";
import { logoutAction } from "@/actions/login-action";


async function getCategories() {
  return await prisma.category.findMany()
}

export default async function OrderSidebar() {

  const categories = await getCategories();



  return (
    <aside className="w-full lg:w-56 xl:w-64 2xl:w-72 bg-gradient-to-br from-white to-gray-50 border-b lg:border-b-0 lg:border-r border-gray-200 shadow-sm">
        <div className="lg:sticky lg:top-0">
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-2 py-1.5 lg:px-3 lg:py-2 shadow-md flex justify-between items-center">
            <Logo />
            <form action={logoutAction}>
              <button className="text-white text-xs bg-white/20 hover:bg-white/30 px-2 py-1 rounded transition-colors">
                Salir
              </button>
            </form>
          </div>

          <div className="p-2 sm:p-3 lg:p-4">
            <div className="mb-2 lg:mb-3">
              <h2 className="text-sm sm:text-base lg:text-lg font-bold text-gray-800 flex items-center gap-2">
                <span className="text-lg sm:text-xl lg:text-2xl">🍽️</span>
                <span>Menú</span>
              </h2>
              <p className="text-xs text-gray-600 mt-0.5">Selecciona una categoría</p>
            </div>

            <nav className="mt-2 lg:mt-3">
              <div className="flex lg:flex-col overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0 gap-2 lg:gap-3 scrollbar-hide">
                {categories.map(category => (
                  <CategoryIcon
                    key={category.id}
                    category={category}
                  />
                ))}
              </div>
            </nav>
          </div>
        </div>
    </aside>
  )
}

