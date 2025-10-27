// Utilidades para llamadas a la API del backend

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
  error?: any
}

export async function apiCall<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    })

    const data = await response.json()
    return data
  } catch (error) {
    console.error('API Error:', error)
    return {
      success: false,
      message: 'Error de conexión con el servidor',
      error,
    }
  }
}

export interface LoginData {
  id: string
  name: string
  lastname?: string
  email?: string
  username?: string
  phone?: string
  image?: string
  role: string
  session_token: string
  roles?: any[]
}

export interface LoginCredentials {
  username?: string
  email?: string
  password: string
}

export async function loginApi(credentials: LoginCredentials): Promise<ApiResponse<LoginData>> {
  return apiCall<LoginData>('/api/users/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  })
}

export interface CreateUserData {
  username?: string
  email?: string
  name: string
  lastname?: string
  phone?: string
  password: string
  role?: string
  image?: string
}

export async function createUserApi(userData: CreateUserData): Promise<ApiResponse<string>> {
  return apiCall<string>('/api/users/create', {
    method: 'POST',
    body: JSON.stringify(userData),
  })
}
