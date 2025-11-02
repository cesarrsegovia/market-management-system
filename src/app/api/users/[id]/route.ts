import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Role } from '@prisma/client'; // 1. Importar el tipo Role
import { revalidatePath } from 'next/cache';

// GET - OBTENER UN USUARIO POR ID
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    if (!user) {
      return NextResponse.json({ message: 'Usuario no encontrado' }, { status: 404 });
    }
    return NextResponse.json(user);
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    return NextResponse.json({ message: 'Error al obtener el usuario' }, { status: 500 });
  }
}

// PUT - ACTUALIZAR UN USUARIO (ej. cambiar rol)
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await request.json();
    const { role } = body;

    // 3. Validación simple del rol
    if (!role || !(role in Role)) {
      return NextResponse.json({ message: 'Rol no válido' }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        role: role as Role, // Le decimos a TS que 'role' es del tipo Enum 'Role'
      },
    });

    // 4. Revalidar la caché de la página de usuarios
    revalidatePath('/dashboard/users');

    // Omitimos la contraseña en la respuesta
    const { password, ...userWithoutPassword } = updatedUser;
    return NextResponse.json(userWithoutPassword);

  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    return NextResponse.json({ message: 'Error al actualizar el usuario' }, { status: 500 });
  }
}