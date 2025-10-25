'use server'

import { prisma } from "@/src/lib/prisma"
import bcrypt from "bcryptjs"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"

type State = {
    error?: string
    success?: boolean
} | null

export async function loginAction(prevState: State, formData: FormData): Promise<State> {
    const username = formData.get('username') as string
    const password = formData.get('password') as string

    // Validar campos
    if (!username || !password) {
        return {
            error: 'Todos los campos son obligatorios'
        }
    }

    try {
        // Buscar usuario en la base de datos
        const user = await prisma.user.findUnique({
            where: {
                username: username
            }
        })

        if (!user) {
            return {
                error: 'Usuario no encontrado'
            }
        }

        // Verificar contraseña
        const isValidPassword = await bcrypt.compare(password, user.password)

        if (!isValidPassword) {
            return {
                error: 'Contraseña incorrecta'
            }
        }

        // Crear cookies de sesión
        const cookieStore = await cookies()
        
        // Cookie con ID (httpOnly para seguridad)
        cookieStore.set('userId', user.id.toString(), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7 // 1 semana
        })

        // Cookie con datos del usuario para el middleware (incluye rol)
        cookieStore.set('user', JSON.stringify({
            id: user.id,
            username: user.username,
            name: user.name,
            role: user.role
        }), {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 60 * 60 * 24 * 7 // 1 semana
        })

        // Redirigir según el rol
        if (user.role === 'ADMIN') {
            redirect('/admin/dashboard')
        } else if (user.role === 'CHEF') {
            redirect('/chef')
        } else if (user.role === 'WAITER') {
            redirect('/order/cafe')
        } else {
            redirect('/order/cafe')
        }

    } catch (error) {
        // Si el error es una redirección, la dejamos pasar
        if (error && typeof error === 'object' && 'digest' in error && 
            typeof error.digest === 'string' && error.digest.includes('NEXT_REDIRECT')) {
            throw error
        }
        
        console.log(error)
        return {
            error: 'Error interno del servidor'
        }
    }
}

export async function logoutAction() {
    const cookieStore = await cookies()
    cookieStore.delete('userId')
    cookieStore.delete('user')
    redirect('/')
}

export async function getCurrentUser() {
    try {
        const cookieStore = await cookies()
        const userCookie = cookieStore.get('user')?.value

        if (!userCookie) {
            return null
        }

        return JSON.parse(userCookie)
    } catch (error) {
        return null
    }
}