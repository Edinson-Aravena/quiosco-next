import { z } from 'zod';

export const OrderSchema = z.object({
  name: z.string()
    .min(1, { message: 'El número de mesa es obligatorio' })
    .regex(/^\d+$/, { message: 'Solo se permiten números' }),
  total: z.number(),
  order: z.array(z.any()),
});