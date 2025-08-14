import { prisma } from "@/src/lib/prisma";
import { products } from '../../../prisma/data/products';
import ProductCard from "@/components/products/ProductCard";

async function getproducts(category: string) {
  const products = await prisma.product.findMany({
    where: {
      category: {
        slug: category
      }
    }
  });

  return products
}


export default async function OrderPage({params}: {params: {category: string}}) {
  const products = await getproducts(params.category);
  

  return (
    <>
      <h1 className="text-2xl my-10">
        Elige y personaliza tu pedido a continuación
      </h1>

      
      <div className="grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-4 items-start">
          {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
          ))}
      </div>
    </>
  )
}
