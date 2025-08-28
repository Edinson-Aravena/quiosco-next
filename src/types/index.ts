import { Order, Product,OrderProducts } from "@prisma/client";

export type OrderItem = Pick<Product, 'id' | 'name' | 'price' > & {
    quantity: number;
    subtotal: number;
}
    


export type OrderWithProducts = Order & {
    orderProducts: (OrderProducts& {
        product: Product;
    })[]
}


