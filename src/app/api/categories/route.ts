import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

//funcion para obtener todas las categorias
export async function GET() {
    try {
        const categories = await prisma.category.findMany();
        return NextResponse.json(categories);
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: 'Error al obtener las categorias' }, { status: 500 });
    }
};

//funcion para crear una nueva categoria
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name } = body;

        if (!name) {
            return NextResponse.json({ message: 'El nombre es requerido' }, { status: 400 });
        }

        const newCategory = await prisma.category.create({
            data: {
                name,
            }
        });
        return NextResponse.json(newCategory, { status: 201 });
    } catch (error) {
        console.log(error);
        if (error instanceof Error && error.message.includes('Unique constraint failed')) {
            return NextResponse.json({ message: 'La categoria ya existe' }, { status: 400 });
        }
        return NextResponse.json({ message: 'Error al crear la categoria' }, { status: 500 });
    }
}