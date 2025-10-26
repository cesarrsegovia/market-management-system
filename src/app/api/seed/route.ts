import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';

// --- Función Auxiliar para obtener el Payload del Token ---
// (La copiamos de nuestra API de 'sales')
async function getTokenPayload() {
  const tokenCookie = cookies().get('auth_token');
  if (!tokenCookie) return null;
  
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const { payload } = await jwtVerify(tokenCookie.value, secret);
    return payload;
  } catch (e) {
    return null;
  }
}
// --------------------------------------------------------

interface ProductSeed {
  name: string;
  description: string;
  price: number;
  categoryId: number;
  quantity: number; // Incluimos la cantidad de stock inicial
}

export async function POST(request: Request) {
  // 1. Autenticación y Autorización
  const token = await getTokenPayload();
  if (token?.role !== 'ADMIN') {
    return NextResponse.json({ message: 'Acceso denegado.' }, { status: 403 });
  }

  // 2. Obtener el array de productos del body
  const productsToCreate: ProductSeed[] = await request.json();

  try {
    // 3. Ejecutar la creación masiva en una transacción
    const createdCount = await prisma.$transaction(async (tx) => {
      let count = 0;
      for (const product of productsToCreate) {
        await tx.product.create({
          data: {
            name: product.name,
            description: product.description,
            price: product.price,
            categoryId: product.categoryId,
            inventory: {
              create: {
                quantity: product.quantity, // Usamos la cantidad del JSON
              },
            },
          },
        });
        count++;
      }
      return count;
    });

    return NextResponse.json({ 
      message: `${createdCount} productos creados exitosamente.` 
    }, { status: 201 });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: 'Error al crear productos', error: (error as Error).message }, 
      { status: 500 }
    );
  }
}