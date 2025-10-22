import prisma from '@/lib/prisma';
import { CreditCard, Package } from 'lucide-react'; // 1. Iconos para decorar

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

// 4. (Simulación) Función para obtener las ventas totales
async function getTotalSales() {
  // Aún no tenemos el modelo 'Sale', así que simularemos el dato.
  return 1250.75;
}


// --- El Componente Principal de la Página ---
export default async function DashboardPage() {
  // 5. Ejecutamos todas las consultas de datos en paralelo
  const [totalProducts, totalCategories, totalSales] = await Promise.all([
    getTotalProducts(),
    getTotalCategories(),
    getTotalSales(),
  ]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      
      {/* 6. Contenedor de las "tarjetas" de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Tarjeta de Ventas Totales */}
        <div className="bg-white p-6 rounded shadow-md flex items-center">
          <CreditCard className="w-12 h-12 text-blue-500 mr-4" />
          <div>
            <h2 className="text-gray-500 text-sm font-semibold">Ventas Totales (Simulado)</h2>
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
        
        {/* (Podríamos añadir más tarjetas, como total de categorías, etc.) */}

      </div>
    </div>
  );
}