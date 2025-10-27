import {create} from 'zustand';
import { OrderItem } from './types';
import { Product } from '@prisma/client';

// Definición de la interfaz del estado global
interface Store {
    order: OrderItem[]; // Array de productos en el pedido
    addToOrder: (product : Product) => void; // Agrega un producto al pedido
    increaseQuantity : (id: number) => void; // Aumenta la cantidad de un producto
    decreaseQuantity : (id: number) => void; // Disminuye la cantidad de un producto
    removeItem: (id: number) => void; // Elimina un producto del pedido
    clearOrder: () => void; // Limpia el pedido
}

// Hook personalizado para acceder y modificar el estado global del pedido
export const useStore = create <Store>((set, get) => ({
    order: [], // Estado inicial: pedido vacío

    // Agrega un producto al pedido o aumenta su cantidad si ya existe
    addToOrder:(product) => {
        const {categoryId, image, ...data} = product
        // Convertir BigInt y Decimal a Number
        const productId = typeof product.id === 'bigint' ? Number(product.id) : product.id
        const productPrice = typeof product.price === 'object' ? Number(product.price) : product.price
        
        let order : OrderItem[] = []
        // Si el producto ya está en el pedido, aumenta su cantidad
        if(get().order.find(item => item.id === productId)) {
            order = get().order.map(item => item.id === productId ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: (item.quantity + 1) * item.price,
            } : item )
        } else {
            // Si es nuevo, lo agrega con cantidad 1
            order = [...get().order,{
                id: productId,
                name: product.name,
                price: productPrice,
                quantity: 1,
                subtotal: 1 * productPrice,
            }]
        }
        set(() => ({
            order
        }))
    },

    // Aumenta la cantidad de un producto en el pedido
    increaseQuantity: (id) =>{
        set((state) => ({
            order: state.order.map(item => item.id === id ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: (item.quantity + 1) * item.price,
            } : item)
        }))
    },

    // Disminuye la cantidad de un producto en el pedido
    decreaseQuantity: (id) => {
        const order = get().order.map(item => item.id === id ? {
            ...item,
            quantity: item.quantity - 1,
            subtotal: (item.quantity - 1) * item.price,
        } : item)

        set(() =>({
            order
        }))
    },

    // Elimina un producto del pedido
    removeItem: (id) => {
        set((state) => ({
            order: state.order.filter(item => item.id !== id)
        }))
    },
    clearOrder:()=> {
        set(()=> ({
            order: []
        }))
    }
}));