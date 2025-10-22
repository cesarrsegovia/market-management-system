import prisma from '@/lib/prisma';
import Link from 'next/link';
import ProductActions from './components/ProductActions';


// 1. Esta función se ejecuta en el SERVIDOR
async function getProducts() {
  const products = await prisma.product.findMany({
    include: {
      category: true, // Incluimos la categoría relacionada
    },
    orderBy: {
      createdAt: 'desc', // Ordenamos por fecha de creación descendente
    },
  });
  return products;
}

// 2. Este es el componente de la página (React Server Component)
export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gestión de Productos</h1>
      
      {/* Aquí irá un botón para "Crear Producto Nuevo" más adelante */}
      <div className="mb-4">
        <Link href="/dashboard/products/new">
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Crear Nuevo Producto
          </button>
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="py-2 px-4 text-left">Nombre</th>
              <th className="py-2 px-4 text-left">Precio</th>
              <th className="py-2 px-4 text-left">Categoría</th>
              <th className="py-2 px-4 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id} className="border-b hover:bg-gray-50">
                <td className="py-2 px-4">{product.name}</td>
                <td className="py-2 px-4">${product.price.toFixed(2)}</td>
                <td className="py-2 px-4">{product.category.name}</td>
                <td className="py-2 px-4">
                  {/* Aquí irán los botones de "Editar" y "Eliminar" */}
                  <ProductActions productId={product.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}