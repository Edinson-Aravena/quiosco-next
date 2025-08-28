import {z} from "zod";
import { Order } from '@prisma/client';


export const OrderSchema = z.object({
    name: z.string().min(1, 'El nombre es obligatorio'),
    total: z.number().min(1, 'Hay errores en el pedido'),
    order: z.array(z.object({
        id: z.number(),
        name: z.string(),
        price: z.number(),
        quantity: z.number(),
        subtotal: z.number()
    }))
})

export const OrderIdSchema = z.object({
    orderId: z.string()
                    .transform((value) => parseInt(value))
                    .refine(value => value > 0, {message: 'El ID de la orden debe ser un número positivo'}),
})