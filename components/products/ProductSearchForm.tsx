"use client"
import { SearchSchema } from "@/src/schema"
import { toast } from "react-toastify"
import { useRouter } from "next/navigation"


export default function ProductSearchForm() {
    const router = useRouter()


    const handleSearchForm = (formData: FormData) => {
        const data = {
            search: formData.get('search')
        }

        // Validación con Zod
        const result = SearchSchema.safeParse(data)
        if(!result.success) {
            result.error.issues.forEach(issue => {
                toast.error(issue.message)
            })
            return
        }

        // Redirección corregida
        router.push(`/admin/products/search?search=${result.data.search}`)
    }
    return (
        <form
            action={handleSearchForm}
            className="flex items-center gap-2 w-full lg:w-auto"
        >
            <div className="relative flex-1 lg:w-80">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
                <input
                    type="text"
                    placeholder="Buscar producto..."
                    className="
                        w-full pl-12 pr-4 py-3
                        border-2 border-gray-200
                        rounded-xl
                        focus:border-amber-500 focus:ring-4 focus:ring-amber-100
                        transition-all duration-300
                        placeholder-gray-400
                        text-gray-700
                        font-medium
                    "
                    name="search"
                />
            </div>

            <button
                type="submit"
                className="
                    bg-gradient-to-r from-indigo-500 to-purple-600
                    hover:from-indigo-600 hover:to-purple-700
                    text-white font-bold
                    px-6 py-3 rounded-xl
                    shadow-lg hover:shadow-xl
                    transition-all duration-300
                    transform hover:scale-105
                    flex items-center gap-2
                    whitespace-nowrap
                "
            >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <span>Buscar</span>
            </button>
        </form>
    )
}
