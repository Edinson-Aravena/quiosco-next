"use client"

import { ProductSchema } from "@/src/schema";
import ProductForm from "./ProductForm";
import { toast } from "react-toastify";
import { createProduct } from "@/actions/create-product-action";
import { useRouter } from "next/navigation";

export default function AddProductForm({ children }: { children: React.ReactNode }) {
    const router = useRouter()

    const handleSubmit = async (formData: FormData) => {
        const data = {
            name: formData.get('name'),
            price: formData.get('price'),
            categoryId: formData.get('categoryId'),
            image: formData.get('image'),
        }
        const result = ProductSchema.safeParse(data)
        if (!result.success) {
            result.error.issues.forEach(issue => {
                toast.error(issue.message)
            })
            return
        }

        const response = await createProduct(result.data)
        if (response?.errors) {
            response.errors.forEach(issue => {
                toast.error(issue.message)
            })
            return
        }

        toast.success('Producto creado correctamente')
        router.push('/admin/products')
    }


    return (
        <div className="bg-white mt-10 px-8 py-10 rounded-2xl shadow-2xl max-w-3xl mx-auto border border-gray-100">
            {/* Header del formulario */}
            <div className="mb-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-lg mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Nuevo Producto</h2>
                <p className="text-gray-600">Completa los campos para agregar un producto al menú</p>
            </div>

            <form
                className="space-y-6"
                action={handleSubmit}
            >
                {children}

                {/* Botón de submit mejorado */}
                <div className="pt-6 border-t border-gray-200">
                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl flex items-center justify-center gap-2 text-lg"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Registrar Producto
                    </button>
                </div>
            </form>
        </div>
    )
}
