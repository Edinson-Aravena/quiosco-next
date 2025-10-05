"use client"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"

type ProductFiltersProps = {
    categories: { id: number; name: string; slug: string }[]
    totalProducts: number
}

export default function ProductFilters({ categories, totalProducts }: ProductFiltersProps) {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'name')
    const [order, setOrder] = useState(searchParams.get('order') || 'asc')
    const [categoryFilter, setCategoryFilter] = useState(searchParams.get('category') || 'all')

    const handleFilterChange = (newSortBy?: string, newOrder?: string, newCategory?: string) => {
        const params = new URLSearchParams(searchParams.toString())

        const finalSortBy = newSortBy || sortBy
        const finalOrder = newOrder || order
        const finalCategory = newCategory || categoryFilter

        params.set('sortBy', finalSortBy)
        params.set('order', finalOrder)

        if (finalCategory === 'all') {
            params.delete('category')
        } else {
            params.set('category', finalCategory)
        }

        // Reset to page 1 when filters change
        params.set('page', '1')

        router.push(`/admin/products?${params.toString()}`)
    }

    const handleSortChange = (value: string) => {
        setSortBy(value)
        handleFilterChange(value, order, categoryFilter)
    }

    const handleOrderChange = () => {
        const newOrder = order === 'asc' ? 'desc' : 'asc'
        setOrder(newOrder)
        handleFilterChange(sortBy, newOrder, categoryFilter)
    }

    const handleCategoryChange = (value: string) => {
        setCategoryFilter(value)
        handleFilterChange(sortBy, order, value)
    }

    const handleReset = () => {
        setSortBy('name')
        setOrder('asc')
        setCategoryFilter('all')
        router.push('/admin/products?page=1')
    }

    const hasActiveFilters = sortBy !== 'name' || order !== 'asc' || categoryFilter !== 'all'

    const getSortLabel = () => {
        switch(sortBy) {
            case 'price': return 'Precio'
            case 'category': return 'Categoría'
            case 'name':
            default: return 'Nombre'
        }
    }

    const getCategoryLabel = () => {
        if (categoryFilter === 'all') return 'Todas'
        const category = categories.find(c => c.slug === categoryFilter)
        return category?.name || 'Todas'
    }

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-50 to-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white shadow-md">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">Filtros y Ordenamiento</h3>
                            <p className="text-xs text-gray-500">Personaliza la vista de productos</p>
                        </div>
                    </div>
                    {hasActiveFilters && (
                        <button
                            onClick={handleReset}
                            className="
                                flex items-center gap-2
                                px-4 py-2 rounded-lg
                                bg-red-100 hover:bg-red-200
                                text-red-700 hover:text-red-900
                                text-sm font-semibold
                                transition-all duration-200
                                transform hover:scale-105
                            "
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Limpiar
                        </button>
                    )}
                </div>
            </div>

            {/* Filtros activos - Resumen visual */}
            {hasActiveFilters && (
                <div className="px-6 py-3 bg-amber-50 border-b border-amber-100">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold text-amber-800">Filtros activos:</span>

                        {sortBy !== 'name' && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-amber-200 text-amber-900">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                                </svg>
                                {getSortLabel()}
                            </span>
                        )}

                        {order !== 'asc' && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-blue-200 text-blue-900">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                                Descendente
                            </span>
                        )}

                        {categoryFilter !== 'all' && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-purple-200 text-purple-900">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                </svg>
                                {getCategoryLabel()}
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Controles de filtros */}
            <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Ordenar por */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                            <svg className="w-4 h-4 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                            </svg>
                            Ordenar por
                        </label>
                        <select
                            value={sortBy}
                            onChange={(e) => handleSortChange(e.target.value)}
                            className="
                                w-full px-4 py-3
                                border-2 border-gray-200
                                rounded-xl
                                focus:border-amber-500 focus:ring-4 focus:ring-amber-100
                                transition-all duration-300
                                text-gray-700 font-medium
                                cursor-pointer
                                bg-white
                            "
                        >
                            <option value="name">📝 Nombre</option>
                            <option value="price">💰 Precio</option>
                            <option value="category">🏷️ Categoría</option>
                        </select>
                    </div>

                    {/* Orden */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                            </svg>
                            Orden
                        </label>
                        <button
                            onClick={handleOrderChange}
                            className="
                                w-full px-4 py-3
                                border-2 border-gray-200
                                rounded-xl
                                hover:border-blue-500 hover:bg-blue-50
                                transition-all duration-300
                                text-gray-700 font-medium
                                flex items-center justify-between
                                group
                                bg-white
                            "
                        >
                            <span className="flex items-center gap-2">
                                {order === 'asc' ? '⬆️' : '⬇️'}
                                {order === 'asc' ? 'Ascendente (A-Z)' : 'Descendente (Z-A)'}
                            </span>
                            <svg
                                className={`w-5 h-5 transition-transform duration-300 text-blue-500 ${order === 'desc' ? 'rotate-180' : ''}`}
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                            </svg>
                        </button>
                    </div>

                    {/* Categoría */}
                    <div>
                        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                            <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                            Categoría
                        </label>
                        <select
                            value={categoryFilter}
                            onChange={(e) => handleCategoryChange(e.target.value)}
                            className="
                                w-full px-4 py-3
                                border-2 border-gray-200
                                rounded-xl
                                focus:border-purple-500 focus:ring-4 focus:ring-purple-100
                                transition-all duration-300
                                text-gray-700 font-medium
                                cursor-pointer
                                bg-white
                            "
                        >
                            <option value="all">🌐 Todas las categorías</option>
                            {categories.map(category => (
                                <option key={category.id} value={category.slug}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Footer con información */}
            <div className="px-6 py-4 bg-gradient-to-r from-slate-50 to-gray-50 border-t border-gray-200">
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
                            {totalProducts}
                        </div>
                        <span className="text-gray-600">
                            <span className="font-bold text-gray-800">{totalProducts}</span> producto{totalProducts !== 1 ? 's' : ''}
                            {categoryFilter !== 'all' && (
                                <span className="text-purple-600 font-semibold"> en {getCategoryLabel()}</span>
                            )}
                        </span>
                    </div>
                    {hasActiveFilters && (
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></span>
                            <span className="text-amber-600 font-semibold text-xs">Filtros aplicados</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
