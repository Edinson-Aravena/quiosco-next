import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  console.log('Middleware ejecutándose para:', pathname)
  
  // Obtener las cookies de usuario
  const userId = request.cookies.get('userId')?.value
  const userCookie = request.cookies.get('user')?.value
  console.log('Cookie userId:', userId)

  // Parse user data if exists
  let user = null
  if (userCookie) {
    try {
      user = JSON.parse(userCookie)
    } catch (e) {
      console.error('Error parsing user cookie:', e)
    }
  }

  // Rutas que requieren autenticación de admin
  if (pathname.startsWith('/admin')) {
    console.log('Accediendo a ruta admin')
    if (!userId || !user) {
      console.log('No hay userId, redirigiendo a /')
      return NextResponse.redirect(new URL('/', request.url))
    }
    
    // Solo ADMIN puede acceder a /admin
    if (user.role !== 'ADMIN') {
      console.log('Usuario no es admin, redirigiendo según rol')
      // Redirigir según el rol
      if (user.role === 'CHEF') {
        return NextResponse.redirect(new URL('/chef', request.url))
      } else if (user.role === 'WAITER') {
        return NextResponse.redirect(new URL('/order/cafe', request.url))
      }
      return NextResponse.redirect(new URL('/', request.url))
    }
    
    console.log('Usuario admin autenticado, permitiendo acceso')
    return NextResponse.next()
  }

  // Ruta de chef
  if (pathname.startsWith('/chef')) {
    console.log('Accediendo a ruta chef')
    if (!userId || !user) {
      console.log('No hay userId, redirigiendo a /')
      return NextResponse.redirect(new URL('/', request.url))
    }
    
    // Solo CHEF y ADMIN pueden acceder
    if (user.role !== 'CHEF' && user.role !== 'ADMIN') {
      console.log('Usuario no es chef ni admin')
      return NextResponse.redirect(new URL('/order/cafe', request.url))
    }
    
    console.log('Usuario chef/admin autenticado, permitiendo acceso')
    return NextResponse.next()
  }

  // Rutas que requieren autenticación (order) - Todos los roles autenticados
  if (pathname.startsWith('/order')) {
    console.log('Accediendo a ruta order')
    if (!userId) {
      console.log('No hay userId, redirigiendo a /')
      return NextResponse.redirect(new URL('/', request.url))
    }
    
    console.log('Usuario autenticado, permitiendo acceso a order')
    return NextResponse.next()
  }

  console.log('Ruta no protegida, continuando')
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/order/:path*', '/chef/:path*']
}