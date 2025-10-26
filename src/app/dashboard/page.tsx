import prisma from '@/lib/prisma';
import { CreditCard, Package, AlertTriangle } from 'lucide-react'; // 1. Iconos para decorar


// 2. Función para obtener el total de productos
async function getTotalProducts() {
  const total = await prisma.product.count();
  return total;
}

// 3. Función para obtener el total de categorías
async function getTotalCategories() {
  const total = await prisma.category.count();
  return total;
}

// 4. (Real) Función para obtener las ventas totales
async function getTotalSales() {
  const salesData = await prisma.sale.aggregate({
    _sum: {
      total: true, // Suma la columna 'total'
    },
  });
  return salesData._sum.total ?? 0; // Devuelve la suma, o 0 si no hay ventas
}

async function getLowStockCount() {
  const lowStockThreshold = 10; // Umbral de bajo stock
  const count = await prisma.product.count({
    where: {
      inventory: {
        quantity: {
          lte: lowStockThreshold, // lte = Menor o Igual que (Less Than or Equal to)
        },
      },
    },
  });
  return count;
}

// --- El Componente Principal de la Página ---
export default async function DashboardPage() {
  // 5. Ejecutamos todas las consultas de datos en paralelo
  const [totalProducts, totalCategories, totalSales, lowStockCount] = await Promise.all([
    getTotalProducts(),
    getTotalCategories(),
    getTotalSales(),
    getLowStockCount(),
  ]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-black">Dashboard</h1>
      
      {/* 6. Contenedor de las "tarjetas" de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Tarjeta de Ventas Totales */}
        <div className="bg-white p-6 rounded shadow-md flex items-center">
          <CreditCard className="w-12 h-12 text-blue-500 mr-4" />
          <div>
            <h2 className="text-gray-500 text-sm font-semibold">Ventas Totales</h2>
            <p className="text-3xl font-bold text-black">${totalSales.toFixed(2)}</p>
          </div>
        </div>

        {/* Tarjeta de Total de Productos */}
        <div className="bg-white p-6 rounded shadow-md flex items-center">
          <Package className="w-12 h-12 text-green-500 mr-4" />
          <div>
            <h2 className="text-gray-500 text-sm font-semibold">Productos Registrados</h2>
            <p className="text-3xl font-bold text-black">{totalProducts}</p>
          </div>
        </div>
        
        {/* Bajo stock */}
        <div className="bg-white p-6 rounded shadow-md flex items-center">
          <AlertTriangle className="w-12 h-12 text-yellow-500 mr-4" /> {/* Icono de advertencia */}
          <div>
            <h2 className="text-gray-500 text-sm font-semibold">Productos Bajos en Stock (&le;10)</h2>
            <p className="text-3xl font-bold text-black">{lowStockCount}</p> {/* Mostramos el conteo */}
          </div>
        </div>

      </div>
    </div>
  );
}