import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  console.log('Middleware ejecutándose para:', pathname)
  
  // Obtener la cookie userId directamente
  const userId = request.cookies.get('userId')?.value
  console.log('Cookie userId:', userId)

  // Rutas que requieren autenticación de admin
  if (pathname.startsWith('/admin')) {
    console.log('Accediendo a ruta admin')
    if (!userId) {
      console.log('No hay userId, redirigiendo a /')
      return NextResponse.redirect(new URL('/', request.url))
    }
    
    console.log('Usuario autenticado, permitiendo acceso a admin')
    return NextResponse.next()
  }

  // Rutas que requieren autenticación (order)
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
  matcher: ['/admin/:path*', '/order/:path*']
}