"use server";

import { prisma } from "@/src/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { UserRole } from "@prisma/client";

export async function createUserAction(formData: FormData) {
  try {
    const username = formData.get('username') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;
    const role = formData.get('role') as UserRole;

    // Validaciones
    if (!username || !password || !role) {
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

    // Verificar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUser) {
      return {
        success: false,
        error: 'El nombre de usuario ya existe'
      };
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el usuario
    await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        name: name || null,
        role
      }
    });

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
