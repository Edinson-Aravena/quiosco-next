"use server";

import { prisma } from "@/src/lib/prisma";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function updateUserAction(userId: number, formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const role = formData.get('role') as 'ADMIN' | 'CHEF' | 'WAITER';
    const newPassword = formData.get('newPassword') as string;

    // No permitir cambiar el rol del admin principal
    if (userId === 1 && role !== 'ADMIN') {
      return {
        success: false,
        error: 'No se puede cambiar el rol del administrador principal'
      };
    }

    const updateData: any = {
      name: name || null,
      role
    };

    // Si se proporciona una nueva contraseña, hashearla
    if (newPassword && newPassword.length >= 6) {
      updateData.password = await bcrypt.hash(newPassword, 10);
    } else if (newPassword && newPassword.length < 6) {
      return {
        success: false,
        error: 'La contraseña debe tener al menos 6 caracteres'
      };
    }

    await prisma.user.update({
      where: { id: userId },
      data: updateData
    });

    revalidatePath('/admin/users');
    
    return {
      success: true,
      message: 'Usuario actualizado exitosamente'
    };
  } catch (error) {
    console.error('Error updating user:', error);
    return {
      success: false,
      error: 'Error al actualizar el usuario'
    };
  }
}
