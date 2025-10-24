import { categories } from "./data/categories";
import { products } from "./data/products";
import { Prisma, PrismaClient } from "@prisma/client";
import bcrypt from 'bcryptjs';


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

        // Create default admin user
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await prisma.user.upsert({
            where: { username: 'admin' },
            update: {},
            create: {
                username: 'admin',
                password: hashedPassword,
                role: 'ADMIN'
            }
        })

        console.log('🌱 Usuario admin creado exitosamente')
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