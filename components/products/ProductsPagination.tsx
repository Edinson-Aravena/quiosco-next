"use client"
import Link from "next/link";
import { useSearchParams } from "next/navigation";


type ProductsPaginationProps = {
    page: number;
    totalPages: number
}


export default function ProductsPagination({ page, totalPages }: ProductsPaginationProps) {
    const searchParams = useSearchParams()

    const createPageUrl = (pageNumber: number) => {
        const params = new URLSearchParams(searchParams.toString())
        params.set('page', pageNumber.toString())
        return `/admin/products?${params.toString()}`
    }

    const pages = Array.from({ length: totalPages }, (_, i) => i + 1)

    return (
        <nav className="flex justify-center items-center gap-2 py-6">
            {/* Botón Anterior */}
            {page > 1 ? (
                <Link
                    href={createPageUrl(page - 1)}
                    className="
                        flex items-center gap-2
                        px-4 py-2.5 rounded-lg
                        bg-white hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50
                        text-gray-700 hover:text-amber-600
                        font-semibold text-sm
                        border-2 border-gray-200 hover:border-amber-300
                        shadow-sm hover:shadow-md
                        transition-all duration-300
                        transform hover:scale-105
                    "
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Anterior</span>
                </Link>
            ) : (
                <div className="px-4 py-2.5 rounded-lg bg-gray-100 text-gray-400 font-semibold text-sm border-2 border-gray-200 cursor-not-allowed flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    <span>Anterior</span>
                </div>
            )}

            {/* Números de página */}
            <div className="flex gap-1">
                {pages.map(currentPage => (
                    <Link
                        key={currentPage}
                        href={createPageUrl(currentPage)}
                        className={`
                            min-w-[40px] h-10
                            flex items-center justify-center
                            rounded-lg
                            font-bold text-sm
                            transition-all duration-300
                            transform hover:scale-110
                            ${page === currentPage
                                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30 scale-110'
                                : 'bg-white hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50 text-gray-700 hover:text-amber-600 border-2 border-gray-200 hover:border-amber-300 shadow-sm hover:shadow-md'
                            }
                        `}
                    >
                        {currentPage}
                    </Link>
                ))}
            </div>

            {/* Botón Siguiente */}
            {page < totalPages ? (
                <Link
                    href={createPageUrl(page + 1)}
                    className="
                        flex items-center gap-2
                        px-4 py-2.5 rounded-lg
                        bg-white hover:bg-gradient-to-r hover:from-amber-50 hover:to-orange-50
                        text-gray-700 hover:text-amber-600
                        font-semibold text-sm
                        border-2 border-gray-200 hover:border-amber-300
                        shadow-sm hover:shadow-md
                        transition-all duration-300
                        transform hover:scale-105
                    "
                >
                    <span>Siguiente</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </Link>
            ) : (
                <div className="px-4 py-2.5 rounded-lg bg-gray-100 text-gray-400 font-semibold text-sm border-2 border-gray-200 cursor-not-allowed flex items-center gap-2">
                    <span>Siguiente</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </div>
            )}
        </nav>
    )
}
