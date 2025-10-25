"use client";

import { useRouter } from "next/navigation";

type Category = {
  id: number;
  name: string;
  slug: string;
  icon: string;
};

type OrderHistoryFiltersProps = {
  categories: Category[];
  filterCategory?: string;
  filterTable?: string;
};

export default function OrderHistoryFilters({
  categories,
  filterCategory,
  filterTable,
}: OrderHistoryFiltersProps) {
  const router = useRouter();

  const handleCategoryChange = (value: string) => {
    const url = value
      ? `/admin/orders/history?page=1&category=${value}${filterTable ? `&table=${filterTable}` : ''}`
      : `/admin/orders/history?page=1${filterTable ? `&table=${filterTable}` : ''}`;
    router.push(url);
  };

  const handleTableChange = (value: string) => {
    const url = value
      ? `/admin/orders/history?page=1&table=${value}${filterCategory ? `&category=${filterCategory}` : ''}`
      : `/admin/orders/history?page=1${filterCategory ? `&category=${filterCategory}` : ''}`;
    router.push(url);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Filtro de Categoría */}
        <div>
          <label htmlFor="category-filter" className="block text-sm font-semibold text-gray-700 mb-2">
            Filtrar por Categoría
          </label>
          <select
            id="category-filter"
            value={filterCategory || ''}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white text-gray-700 font-medium cursor-pointer transition-colors hover:border-amber-400"
          >
            <option value="">Todas las categorías</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Filtro de Mesa */}
        <div>
          <label htmlFor="table-filter" className="block text-sm font-semibold text-gray-700 mb-2">
            Filtrar por Mesa
          </label>
          <select
            id="table-filter"
            value={filterTable || ''}
            onChange={(e) => handleTableChange(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent bg-white text-gray-700 font-medium cursor-pointer transition-colors hover:border-amber-400"
          >
            <option value="">Todas las mesas</option>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((tableNumber) => (
              <option key={tableNumber} value={tableNumber}>
                Mesa {tableNumber}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
