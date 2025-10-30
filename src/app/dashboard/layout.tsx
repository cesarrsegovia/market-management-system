import Link from 'next/link';
import Header from './products/components/Header';
import { getServerSideUser } from '@/lib/auth';

export default async function DashboardLayout({
  children, // 1. 'children' es la página que se está mostrando
}: {
  children: React.ReactNode;
}) {
  const user = await getServerSideUser(); // 3. Obtener el payload del usuario
  const userRole = user?.role;// Obtener el rol
  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <Header />
      
      {/* 2. Barra Lateral de Navegación */}
      <div className="flex flex-1 overflow-hidden">
      <aside className="w-56 bg-gray-800 text-white p-4">
        <h2 className="text-xl font-bold mb-4">Market Admin</h2>
        <nav>
          <ul>
            <li className="mb-2">
              <Link href="/dashboard">
                <span className="block p-2 rounded hover:bg-gray-700">Estadísticas</span>
              </Link>
            </li>
            <li className="mb-2">
              <Link href="/dashboard/products">
                <span className="block p-2 rounded hover:bg-gray-700">Productos</span>
              </Link>
            </li>
            <li className="mb-2">
              <Link href="/dashboard/sales">
                <span className="block p-2 rounded hover:bg-gray-700">Historial Ventas</span>
              </Link>
            </li>
            {/* 4. Mostrar solo si el rol es ADMIN */}
              {userRole === 'ADMIN' && (
                <li className="mb-2">
                  <Link href="/dashboard/users">
                    <span className="block p-2 rounded hover:bg-gray-700">Usuarios</span>
                  </Link>
                </li>
                )}
          </ul>
        </nav>
      </aside>

      {/* 3. Contenido Principal de la Página */}
      <main className="flex-1 overflow-y-auto p-6">
        {children}
      </main>
    </div>
    </div>
  );
}