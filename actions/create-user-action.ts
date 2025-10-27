"use server";

import { revalidatePath } from "next/cache";
import { createUserApi } from "@/src/lib/api";

export async function createUserAction(formData: FormData) {
  try {
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const role = formData.get('role') as string;

    // Validaciones
    if (!username || !password || !role || !name) {
      return {
        success: false,
        error: 'Todos los campos son requeridos'
      };
    }

    if (password.length < 6) {
      return {
        success: false,
        error: 'La contraseña debe tener al menos 6 caracteres'
      };
    }

    // Llamar a la API del backend para crear el usuario
    const response = await createUserApi({
      username,
      email,
      name,
      password,
      role
    });

    if (!response.success) {
      return {
        success: false,
        error: response.message || 'Error al crear el usuario'
      };
    }

    revalidatePath('/admin/users');
    
    return {
      success: true,
      message: 'Usuario creado exitosamente'
    };
  } catch (error) {
    console.error('Error creating user:', error);
    return {
      success: false,
      error: 'Error al crear el usuario'
    };
  }
}
