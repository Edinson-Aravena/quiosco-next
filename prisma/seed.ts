import { categories } from "./data/categories";
import { products } from "./data/products";
import { Prisma, PrismaClient } from "@prisma/client";


const prisma = new PrismaClient()


async function main(){
    try{
        await prisma.category.createMany({
            data: categories
        })

        // Only seed products if there are any
        if (products.length > 0) {
            await prisma.product.createMany({
                data: products
            })
        }
    } catch(error){
        console.log(error)
    }
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })