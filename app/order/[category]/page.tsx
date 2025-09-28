import { prisma } from "@/src/lib/prisma";
import { products } from '../../../prisma/data/products';
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

      
      <div className="grid grid-cols-1   xl:grid-cols-3 2xl:grid-cols-4 gap-4 items-start">
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
