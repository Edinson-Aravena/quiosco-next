import { Order, Product,OrderProducts } from "@prisma/client";

export type OrderItem = {
    id: number;
    name: string;
    price: number;
    quantity: number;
    subtotal: number;
}
    


export type OrderWithProducts = Order & {
    orderProducts: (OrderProducts& {
        product: Product;
    })[]
}


