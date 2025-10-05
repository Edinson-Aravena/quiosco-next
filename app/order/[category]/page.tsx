import { prisma } from "@/src/lib/prisma";
import ProductCard from "@/components/products/ProductCard";
import Heading from "@/components/ui/Heading";

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
      <Heading>
        Elige y personaliza el pedido a continuación
      </Heading>


      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-6 items-start pb-10">
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
