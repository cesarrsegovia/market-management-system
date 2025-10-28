import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { revalidatePath } from 'next/cache';

export async function GET(request: Request) {
    try {
        const products = await prisma.product.findMany({
            include: {
                category: true, //incluimos la relacion con category
                inventory: true,
            },
            orderBy:{
                createdAt: 'desc',
            }
        });
        return NextResponse.json(products);
    } catch (error) {
        console.log(error);
        return NextResponse.json({ message: "Error al obtener los productos" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, description, price, categoryId } = body;

        if (!name || !price || !categoryId) {
            return NextResponse.json({ message: "Nombre, precio y ID son requeridos" }, { status: 400 });
        }
        const newProduct = await prisma.product.create({
            data: {
                name,
                description,
                price,
                categoryId,
                // agregamos la creación del inventario asociado
                inventory: {
                    create: {
                        quantity: 0, // Inicia el stock en 0
                    },
                },
            },
            // También queremos que la respuesta incluya el nuevo inventario
            include: {
                inventory: true,
            },
        });
        // Le decimos a Next.js que los datos de esta página están obsoletos.
        revalidatePath('/dashboard/products');
        return NextResponse.json(newProduct, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Error al crear el producto" }, { status: 500 });
    }
}