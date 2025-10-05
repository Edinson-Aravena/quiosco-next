import { redirect } from "next/navigation";
import ProductsPagination from "@/components/products/ProductsPagination";
import ProductTable from "@/components/products/ProductsTable";
import Heading from "@/components/ui/Heading";
import { prisma } from "@/src/lib/prisma";
import Link from "next/link";
import ProductSearchForm from '../../../components/products/ProductSearchForm';
import ProductFilters from "@/components/products/ProductFilters";


async function getCategories() {
  return await prisma.category.findMany({
    select: {
      id: true,
      name: true,
      slug: true
    }
  })
}

async function productsCount(categorySlug?: string) {
  if (categorySlug && categorySlug !== 'all') {
    const category = await prisma.category.findFirst({
      where: { slug: categorySlug }
    })
    if (!category) return 0

    return await prisma.product.count({
      where: { categoryId: category.id }
    })
  }
  return await prisma.product.count()
}


async function getProducts(
  page: number,
  pageSize: number,
  sortBy: string = 'name',
  order: string = 'asc',
  categorySlug?: string
) {
  const skip = (page - 1) * pageSize

  // Construir el where clause
  const whereClause: any = {}

  if (categorySlug && categorySlug !== 'all') {
    const category = await prisma.category.findFirst({
      where: { slug: categorySlug }
    })
    if (category) {
      whereClause.categoryId = category.id
    }
  }

  // Construir el orderBy clause
  let orderByClause: any = {}

  switch (sortBy) {
    case 'price':
      orderByClause = { price: order }
      break
    case 'category':
      orderByClause = { category: { name: order } }
      break
    case 'name':
    default:
      orderByClause = { name: order }
      break
  }

  const products = await prisma.product.findMany({
    take: pageSize,
    skip,
    where: whereClause,
    orderBy: orderByClause,
    include: {
      category: true
    }
  })

  return products
}

export type ProductsWithCategory = Awaited<ReturnType<typeof getProducts>>

export default async function ProductsPage({
  searchParams
}: {
  searchParams: {
    page: string
    sortBy?: string
    order?: string
    category?: string
  }
}) {

  const page = +searchParams.page || 1
  const pageSize = 10
  const sortBy = searchParams.sortBy || 'name'
  const order = searchParams.order || 'asc'
  const categorySlug = searchParams.category

  if (page < 0) redirect('/admin/products')

  const categoriesData = getCategories()
  const productsData = getProducts(page, pageSize, sortBy, order, categorySlug)
  const totalProductsData = productsCount(categorySlug)

  const [categories, products, totalProducts] = await Promise.all([
    categoriesData,
    productsData,
    totalProductsData
  ])

  const totalPages = Math.ceil(totalProducts / pageSize)

  if (page > totalPages && totalPages > 0) redirect('/admin/products')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <Heading>Administrar Productos</Heading>

        {/* Estadísticas */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center text-2xl shadow-md">
                📦
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-900">{totalProducts}</p>
                <p className="text-sm text-purple-700 font-medium">
                  {categorySlug && categorySlug !== 'all' ? 'Productos filtrados' : 'Total de Productos'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-4 border border-indigo-200">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center text-2xl shadow-md">
                📄
              </div>
              <div>
                <p className="text-2xl font-bold text-indigo-900">
                  {totalPages > 0 ? `Página ${page} de ${totalPages}` : 'Sin resultados'}
                </p>
                <p className="text-sm text-indigo-700 font-medium">Navegación</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Acciones */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <Link
            href={'/admin/products/new'}
            className="
              group
              bg-gradient-to-r from-amber-500 to-orange-500
              hover:from-amber-600 hover:to-orange-600
              text-white font-bold text-lg
              px-8 py-4 rounded-xl
              shadow-lg hover:shadow-xl
              transition-all duration-300
              transform hover:scale-105
              flex items-center justify-center gap-3
              w-full lg:w-auto
            "
          >
            <svg className="w-6 h-6 transition-transform group-hover:rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Crear Producto</span>
          </Link>

          <ProductSearchForm />
        </div>
      </div>

      {/* Filtros y Ordenamiento */}
      <ProductFilters
        categories={categories}
        totalProducts={totalProducts}
      />

      {/* Tabla de productos */}
      {products.length > 0 ? (
        <>
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            <ProductTable
              products={products}
            />
          </div>

          {/* Paginación */}
          <ProductsPagination
            page={page}
            totalPages={totalPages}
          />
        </>
      ) : (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-xl font-semibold text-gray-700 mb-2">No se encontraron productos</p>
          <p className="text-gray-500 mb-6">
            {categorySlug && categorySlug !== 'all'
              ? 'No hay productos en esta categoría con los filtros aplicados'
              : 'Intenta ajustar los filtros o crear un nuevo producto'
            }
          </p>
          <Link
            href="/admin/products?page=1"
            className="inline-flex items-center gap-2 text-amber-600 hover:text-amber-700 font-semibold"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Limpiar filtros
          </Link>
        </div>
      )}
    </div>
  )
}
