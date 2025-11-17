"use client"

import { useState, useEffect } from "react"
import { assignDeliveryAction } from "@/actions/assign-delivery-action"
import { getDeliveryUsersAction } from "@/actions/get-delivery-users-action"
import { formatCurrency } from "@/src/utils"
import { toast } from "react-toastify"

type DeliveryOrder = {
    id: string
    status: string
    timestamp: string
    client: {
        name: string
        lastname: string | null
        phone: string | null
    } | null
    delivery: {
        id: string
        name: string
        lastname: string | null
        phone: string | null
    } | null
    address: {
        address: string
        neighborhood: string
    } | null
    deliveryOrderProducts: Array<{
        productId: string
        quantity: number
        product: {
            name: string
            price: number
        }
    }>
}

type DeliveryUser = {
    id: string
    name: string
    lastname: string | null
    phone: string | null
}

interface Props {
    order: DeliveryOrder
    onUpdate: () => void
}

export default function DeliveryOrderCard({ order, onUpdate }: Props) {
    const [deliveryUsers, setDeliveryUsers] = useState<DeliveryUser[]>([])
    const [selectedDelivery, setSelectedDelivery] = useState<string>("")
    const [isAssigning, setIsAssigning] = useState(false)

    const isPending = order.status === 'PAGADO'
    const isDispatched = order.status === 'DESPACHADO'

    useEffect(() => {
        loadDeliveryUsers()
    }, [])

    const loadDeliveryUsers = async () => {
        const result = await getDeliveryUsersAction()
        if (result.success) {
            setDeliveryUsers(result.data)
        }
    }

    const handleAssignDelivery = async () => {
        if (!selectedDelivery) {
            toast.error("Selecciona un repartidor")
            return
        }

        setIsAssigning(true)
        const result = await assignDeliveryAction(order.id, selectedDelivery)
        setIsAssigning(false)

        if (result.success) {
            toast.success(result.message)
            onUpdate()
        } else {
            toast.error(result.error)
        }
    }

    const total = order.deliveryOrderProducts.reduce(
        (sum, item) => sum + (item.product.price * item.quantity),
        0
    )

    const statusConfig = isPending
        ? {
            gradient: 'from-yellow-500 to-yellow-600',
            bgColor: 'from-yellow-50 to-yellow-100',
            borderColor: 'border-yellow-300',
            badgeBg: 'from-yellow-500 to-yellow-600',
            icon: '⏳',
            statusBadge: 'PENDIENTE'
        }
        : {
            gradient: 'from-blue-500 to-blue-600',
            bgColor: 'from-blue-50 to-blue-100',
            borderColor: 'border-blue-300',
            badgeBg: 'from-blue-500 to-blue-600',
            icon: '🛵',
            statusBadge: 'EN CAMINO'
        }

    return (
        <div className={`bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border ${statusConfig.borderColor}`}>
            {/* Header decorativo */}
            <div className={`h-1.5 bg-gradient-to-r ${statusConfig.badgeBg}`}></div>

            {/* Badge de orden y estado */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
                <div className={`bg-gradient-to-r ${statusConfig.badgeBg} text-white px-3 py-1 rounded-full text-xs font-bold shadow-md`}>
                    Orden #{order.id}
                </div>
                <div className={`bg-gradient-to-r ${statusConfig.bgColor} text-gray-800 px-3 py-1 rounded-full text-xs font-bold shadow-sm border ${statusConfig.borderColor}`}>
                    {statusConfig.statusBadge}
                </div>
            </div>

            <div className="p-6 space-y-5">
                {/* Cliente */}
                <div className="flex items-center gap-3 pt-2">
                    <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${statusConfig.bgColor} flex items-center justify-center text-2xl shadow-md`}>
                        {statusConfig.icon}
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Cliente</p>
                        <p className="text-lg font-bold text-gray-900">
                            {order.client?.name} {order.client?.lastname}
                        </p>
                        {order.client?.phone && (
                            <p className="text-xs text-gray-500">📞 {order.client.phone}</p>
                        )}
                    </div>
                </div>

                {/* Dirección */}
                {order.address && (
                    <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-start gap-2">
                            <span className="text-lg">📍</span>
                            <div>
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Dirección de entrega</p>
                                <p className="text-sm font-semibold text-gray-800">{order.address.address}</p>
                                <p className="text-xs text-gray-600">{order.address.neighborhood}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Productos */}
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg">🍽️</span>
                        <p className="text-sm font-bold text-gray-700 uppercase tracking-wide">Productos</p>
                    </div>

                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-4 space-y-3 max-h-48 overflow-y-auto">
                        {order.deliveryOrderProducts.map((item, idx) => (
                            <div
                                key={idx}
                                className="flex items-center gap-3 pb-3 border-b border-gray-200 last:border-b-0 last:pb-0"
                            >
                                <div className={`flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br ${statusConfig.badgeBg} flex items-center justify-center text-white font-bold text-sm shadow-md`}>
                                    {item.quantity}
                                </div>
                                <p className="flex-1 text-sm font-medium text-gray-800">
                                    {item.product.name}
                                </p>
                                <p className="text-xs text-gray-500 font-semibold">
                                    {formatCurrency(item.product.price * item.quantity)}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Total */}
                <div className="flex items-center justify-between pt-4 border-t-2 border-dashed border-gray-300">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">💰</span>
                        <p className="text-base font-bold text-gray-700">Total</p>
                    </div>
                    <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
                        {formatCurrency(total)}
                    </p>
                </div>

                {/* Asignación de repartidor o info del repartidor */}
                {isPending ? (
                    <div className="space-y-3">
                        <label className="block text-sm font-bold text-gray-700 uppercase tracking-wide">
                            🛵 Asignar Repartidor
                        </label>
                        <select
                            value={selectedDelivery}
                            onChange={(e) => setSelectedDelivery(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
                        >
                            <option value="">Selecciona un repartidor</option>
                            {deliveryUsers.map((user) => (
                                <option key={user.id} value={user.id}>
                                    {user.name} {user.lastname}
                                </option>
                            ))}
                        </select>
                        <button
                            onClick={handleAssignDelivery}
                            disabled={isAssigning || !selectedDelivery}
                            className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-300 disabled:to-gray-400 text-white font-bold text-base py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isAssigning ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Asignando...</span>
                                </>
                            ) : (
                                <>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    <span>Asignar y Despachar</span>
                                </>
                            )}
                        </button>
                    </div>
                ) : (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">🛵</span>
                            <p className="text-sm font-bold text-gray-700 uppercase tracking-wide">Repartidor Asignado</p>
                        </div>
                        <p className="text-lg font-bold text-blue-900">
                            {order.delivery?.name} {order.delivery?.lastname}
                        </p>
                        {order.delivery?.phone && (
                            <p className="text-sm text-blue-700 mt-1">📞 {order.delivery.phone}</p>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
