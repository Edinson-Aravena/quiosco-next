"use server";

import { prisma } from "@/src/lib/prisma";
import { revalidatePath } from "next/cache";

export async function deleteUserAction(userId: number) {
  try {
    // No permitir eliminar el usuario admin principal (id: 1)
    if (userId === 1) {
      return {
        success: false,
        error: 'No se puede eliminar el usuario administrador principal'
      };
    }

    await prisma.user.delete({
      where: { id: userId }
    });

    revalidatePath('/admin/users');
    
    return {
      success: true,
      message: 'Usuario eliminado exitosamente'
    };
  } catch (error) {
    console.error('Error deleting user:', error);
    return {
      success: false,
      error: 'Error al eliminar el usuario'
    };
  }
}
