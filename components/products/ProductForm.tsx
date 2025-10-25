import { prisma } from "@/src/lib/prisma"
import { categories } from '../../prisma/data/categories';
import ImageUpload from "./ImageUpload";
import { Product } from "@prisma/client";

async function getCategories() {
    return await prisma.category.findMany()
}

type ProductFormProps = {
    product?: Product
}

export default async function ProductForm({product}: ProductFormProps) {

    const categories = await getCategories()

    return (
        <div className="space-y-6">
            {/* Campo de Nombre */}
            <div className="space-y-2">
                <label
                    className="block text-sm font-semibold text-gray-700"
                    htmlFor="name"
                >
                    <span className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        Nombre del Producto
                    </span>
                </label>
                <input
                    id="name"
                    type="text"
                    name="name"
                    className="block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all shadow-sm hover:border-gray-400"
                    placeholder="Ej: Café Americano, Pizza Margarita..."
                    defaultValue={product?.name}
                    required
                />
            </div>

            {/* Campo de Precio */}
            <div className="space-y-2">
                <label
                    className="block text-sm font-semibold text-gray-700"
                    htmlFor="price"
                >
                    <span className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Precio
                    </span>
                </label>
                <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">$</span>
                    <input
                        id="price"
                        name="price"
                        type="number"
                        step="0.01"
                        min="0"
                        className="block w-full pl-8 pr-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all shadow-sm hover:border-gray-400"
                        placeholder="0.00"
                        defaultValue={product?.price}
                        required
                    />
                </div>
            </div>

            {/* Campo de Categoría */}
            <div className="space-y-2">
                <label
                    className="block text-sm font-semibold text-gray-700"
                    htmlFor="categoryId"
                >
                    <span className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                        </svg>
                        Categoría
                    </span>
                </label>
                <select
                    className="block w-full px-4 py-3 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all shadow-sm hover:border-gray-400 cursor-pointer"
                    id="categoryId"
                    name="categoryId"
                    defaultValue={product?.categoryId}
                    required
                >
                    <option value="" disabled>-- Seleccione una categoría --</option>
                    {categories.map(category => (
                        <option
                            key={category.id}
                            value={category.id}
                        >{category.name}</option>
                    ))}
                </select>
            </div>

            {/* Imagen del Producto */}
            <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                    <span className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Imagen del Producto
                    </span>
                </label>
                <ImageUpload
                    image={product?.image}
                />
            </div>
        </div>
    )
}