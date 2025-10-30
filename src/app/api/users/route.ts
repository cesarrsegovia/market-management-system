import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  // Nota: La autorización (verificar si es ADMIN)
  // la manejará nuestro middleware.
  // Así, la lógica aquí es simple.

  try {
    const users = await prisma.user.findMany({
      // Excluimos el campo 'password' de la respuesta por seguridad
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error('Error al obtener usuarios:', error);
    return NextResponse.json(
      { message: 'Error al obtener los usuarios' },
      { status: 500 }
    );
  }
}