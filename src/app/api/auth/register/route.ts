import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';


export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, email, password } = body;

        //hashear la pass
        const hashedPassword = await bcrypt.hash(password, 10);

        //crear usuario en la db
        const newUser = await prisma.user.create({
            data: {
                email,
                name,
                password: hashedPassword
            }
        })

        //retornar el usuario creado (sin la pass)
        const { password: _, ...userWithoutPassword } = newUser;
        return NextResponse.json(userWithoutPassword, { status: 201 });
    } catch (error) {
        console.error(error)
        //manejar error de mail duplicado
        if (error instanceof Error && error.message.includes('Unique constraint failed')) {
            return NextResponse.json({ message: 'Email already exists' }, { status: 409 });
        }
        return NextResponse.json({ message: 'Error al crear usuario' }, { status: 500 });
    }
}