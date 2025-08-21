import {create} from 'zustand';
import { OrderItem } from './types';
import { Product } from '@prisma/client';

// Definición de la interfaz del estado global
interface Store {
    order: OrderItem[]; // Array de productos en el pedido
    addToOrder: (product : Product) => void; // Agrega un producto al pedido
    increaseQuantity : (id: Product['id']) => void; // Aumenta la cantidad de un producto
    decreaseQuantity : (id: Product['id']) => void; // Disminuye la cantidad de un producto
    removeItem: (id:Product['id']) => void; // Elimina un producto del pedido
    clearOrder: () => void; // Limpia el pedido
}

// Hook personalizado para acceder y modificar el estado global del pedido
export const useStore = create <Store>((set, get) => ({
    order: [], // Estado inicial: pedido vacío

    // Agrega un producto al pedido o aumenta su cantidad si ya existe
    addToOrder:(product) => {
        const {categoryId, image, ...data} = product
        let order : OrderItem[] = []
        // Si el producto ya está en el pedido, aumenta su cantidad
        if(get().order.find(item => item.id === product.id)) {
            order = get().order.map(item => item.id === product.id ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: (item.quantity + 1) * product.price,
            } : item )
        } else {
            // Si es nuevo, lo agrega con cantidad 1
            order = [...get().order,{
                ...data,
                quantity: 1,
                subtotal: 1 * product.price,
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