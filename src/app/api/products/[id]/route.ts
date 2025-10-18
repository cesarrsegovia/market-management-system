import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

//funcion para obtener un producto por su ID
export async function GET(request: Request, { params }: { params: { id: string } }) {
    try {
        const  id  = parseInt(params.id);
        const product = await prisma.product.findUnique({
            where: { id },
            include: { category: true }, //tambien traemos la categoria
        })
        if (!product) {
            return NextResponse.json({ message: 'Producto no encontrado' }, { status: 404 });
        }
        return NextResponse.json(product);
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: 'Error al obtener el producto' }, { status: 500 });
    }
}

//funcion para actualizar un producto por su ID
export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const id = parseInt(params.id);
        const body = await request.json();
        const { name, description, price, categoryId } = body;

        const updatedProduct = await prisma.product.update({
            where: { id },
            data: {
                name,
                description,
                price,
                categoryId,
            }
        })
        return NextResponse.json(updatedProduct);
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: 'Error al actualizar el producto' }, { status: 500 });
    }
};

//funcion para eliminar un producto por su ID
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const id = parseInt(params.id);
        await prisma.product.delete({
            where: { id },
        });
        return new NextResponse(null, { status: 204 });
    } catch (error) {
        return NextResponse.json({ message: 'Error al eliminar el producto' }, { status: 500 });
    }
}