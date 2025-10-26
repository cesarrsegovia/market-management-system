import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers'; // Para leer las cookies
import { jwtVerify } from 'jose'; // Para leer el token

// FUNCIÓN AUXILIAR para obtener el payload del token
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

export async function POST(request: Request) {
  // 1. Verificar el usuario y obtener el body
  const token = await getTokenPayload();
  if (!token || !token.userId) {
    return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
  }

  // El 'body' será un array de items en el carrito
  // Ejemplo: [{ productId: 1, quantity: 2 }, { productId: 3, quantity: 1 }]
  const cart: { productId: number; quantity: number }[] = await request.json();

  if (!cart || cart.length === 0) {
    return NextResponse.json({ message: 'El carrito está vacío' }, { status: 400 });
  }

  // 2. ¡Iniciamos la TRANSACCIÓN!
  try {
    const newSale = await prisma.$transaction(async (tx) => {
      // 'tx' es una versión de 'prisma' segura para transacciones

      // 2a. Obtener todos los productos del carrito y bloquearlos para la transacción
      const productIds = cart.map((item) => item.productId);
      const productsInCart = await tx.product.findMany({
        where: { id: { in: productIds } },
        include: { inventory: true },
      });

      let total = 0;
      const saleItemsData = [];
      const inventoryUpdates = [];

      // 2b. Validar el stock y calcular el total
      for (const item of cart) {
        const product = productsInCart.find((p) => p.id === item.productId);
        
        if (!product || !product.inventory) {
          throw new Error(`Producto con ID ${item.productId} no encontrado o sin inventario.`);
        }
        if (product.inventory.quantity < item.quantity) {
          throw new Error(`Stock insuficiente para ${product.name}.`);
        }

        total += product.price * item.quantity;
        saleItemsData.push({
          productId: item.productId,
          quantity: item.quantity,
          price: product.price, // Guardamos el precio del momento
        });
        
        // Preparamos la actualización del inventario
        inventoryUpdates.push(
          tx.inventory.update({
            where: { id: product.inventory.id },
            data: { quantity: { decrement: item.quantity } }, // Restamos el stock
          })
        );
      }

      // 2c. Crear el 'Recibo' (Sale) y sus 'Items' (SaleItem)
      const sale = await tx.sale.create({
        data: {
          userId: token.userId as number,
          total: total,
          items: {
            createMany: {
              data: saleItemsData,
            },
          },
        },
      });

      // 2d. Ejecutar todas las actualizaciones de inventario
      await Promise.all(inventoryUpdates);

      return sale; // Si todo va bien, 'newSale' recibirá este valor
    });

    // 3. Si la transacción fue exitosa, devolvemos la venta
    return NextResponse.json(newSale, { status: 201 });

  } catch (error) {
    // 4. Si algo falló, Prisma hace 'rollback' automáticamente
    console.error(error);
    return NextResponse.json(
      { message: (error as Error).message || 'Error al procesar la venta' },
      { status: 400 } // 400 Bad Request (usualmente por stock)
    );
  }
}