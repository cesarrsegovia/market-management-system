import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { Role } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';

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

export async function POST(request: Request) {
  // 3. El middleware ya verificó que el usuario es ADMIN
  try {
    const body = await request.json();
    const { email, name, password, role } = body;

    // 4. Validación de entrada
    if (!email || !password || !role) {
      return NextResponse.json(
        { message: 'Email, contraseña y rol son requeridos' },
        { status: 400 }
      );
    }
    if (!(role in Role)) {
      return NextResponse.json({ message: 'Rol no válido' }, { status: 400 });
    }

    // 5. Hashear la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // 6. Crear el nuevo usuario
    const newUser = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: role as Role,
      },
    });

    // 7. Refrescar la página de la lista de usuarios
    revalidatePath('/dashboard/users');

    // 8. Devolver el usuario creado (sin contraseña)
    const { password: _, ...userWithoutPassword } = newUser;
    return NextResponse.json(userWithoutPassword, { status: 201 });

  } catch (error) {
    // Manejar error de email duplicado
    if (error instanceof Error && error.message.includes('Unique constraint failed')) {
      return NextResponse.json({ message: 'El email ya está en uso.' }, { status: 409 });
    }
    console.error(error);
    return NextResponse.json(
      { message: 'Error al crear el usuario' },
      { status: 500 }
    );
  }
}