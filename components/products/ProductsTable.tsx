"use client"
import { ProductsWithCategory } from "@/app/admin/products/page"
import { formatCurrency } from "@/src/utils"
import Link from "next/link"
import DeleteProductButton from "@/components/products/DeleteProductButton"
import { useSearchParams } from "next/navigation"

type ProductTableProps = {
    products: ProductsWithCategory
}


export default function ProductTable({ products }: ProductTableProps) {
    const searchParams = useSearchParams()
    const sortBy = searchParams.get('sortBy') || 'name'
    const order = searchParams.get('order') || 'asc'

    const getSortIcon = (column: string) => {
        if (sortBy !== column) return null

        return (
            <svg
                className={`w-4 h-4 inline-block ml-1 transition-transform ${order === 'desc' ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
            >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
            </svg>
        )
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                        <th scope="col" className="py-4 pl-6 pr-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            <div className="flex items-center">
                                Producto
                                {getSortIcon('name')}
                            </div>
                        </th>
                        <th scope="col" className="px-3 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            <div className="flex items-center">
                                Precio
                                {getSortIcon('price')}
                            </div>
                        </th>
                        <th scope="col" className="px-3 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                            <div className="flex items-center">
                                Categoría
                                {getSortIcon('category')}
                            </div>
                        </th>
                        <th scope="col" className="relative py-4 pl-3 pr-6 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">
                            Acciones
                        </th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                    {products.map((product, index) => (
                        <tr
                            key={product.id}
                            className="hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 transition-colors duration-200"
                        >
                            <td className="py-4 pl-6 pr-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-lg shadow-sm">
                                        🍽️
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-gray-900">{product.name}</p>
                                        <p className="text-xs text-gray-500">ID: {product.id}</p>
                                    </div>
                                </div>
                            </td>
                            <td className="px-3 py-4">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-green-100 text-green-800">
                                    {formatCurrency(product.price)}
                                </span>
                            </td>
                            <td className="px-3 py-4">
                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800">
                                    {product.category.name}
                                </span>
                            </td>
                            <td className="py-4 pl-3 pr-6">
                                <div className="flex items-center justify-end gap-2">
                                    <Link
                                        href={`/admin/products/${product.id}/edit`}
                                        className="
                                            inline-flex items-center gap-1
                                            px-3 py-2 rounded-lg
                                            bg-indigo-100 hover:bg-indigo-200
                                            text-indigo-700 hover:text-indigo-900
                                            text-sm font-semibold
                                            transition-all duration-200
                                            transform hover:scale-105
                                        "
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        <span>Editar</span>
                                    </Link>
                                    <DeleteProductButton id={product.id} name={product.name} />
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}