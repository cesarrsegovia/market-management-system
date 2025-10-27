import prisma from '@/lib/prisma';
import { format } from 'date-fns'; // 1. Librería para formatear fechas

// 2. Función para obtener el historial de ventas
async function getSalesHistory() {
  const sales = await prisma.sale.findMany({
    orderBy: {
      createdAt: 'desc', // Mostrar las más recientes primero
    },
    include: {
      user: { // Incluir el email del usuario que hizo la venta
        select: { email: true },
      },
      items: { // Incluir los items de cada venta
        include: {
          product: { // Incluir el nombre del producto de cada item
            select: { name: true },
          },
        },
      },
    },
  });
  return sales;
}

// --- El Componente Principal de la Página ---
export default async function SalesHistoryPage() {
  const sales = await getSalesHistory();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-black">Historial de Ventas</h1>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="py-2 px-4 text-left">Fecha</th>
              <th className="py-2 px-4 text-left">Usuario</th>
              <th className="py-2 px-4 text-left">Items Vendidos</th>
              <th className="py-2 px-4 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {sales.map((sale) => (
              <tr key={sale.id} className="border-b hover:bg-gray-50">
                <td className="py-2 px-4 text-black">
                  {/* 3. Formateamos la fecha */}
                  {format(new Date(sale.createdAt), 'dd/MM/yyyy HH:mm')}
                </td>
                <td className="py-2 px-4 text-black">{sale.user.email}</td>
                <td className="py-2 px-4 text-black">
                  {/* 4. Mostramos los items de forma concisa */}
                  {sale.items.map(item => (
                    `${item.quantity}x ${item.product.name}`
                  )).join(', ')}
                </td>
                <td className="py-2 px-4 text-right text-black">${sale.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}