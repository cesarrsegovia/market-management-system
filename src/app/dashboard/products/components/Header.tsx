// src/components/Header.tsx
"use client"; // Necesita ser Client Component para leer localStorage

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function Header() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const router = useRouter();
  const auth = useAuth();

  const handleLogout = () => {
    auth.logout(); // 3. Llamar a logout del contexto
    router.push('/login');
    console.log('Header: Estado actual del contexto ->', { 
    isLoading: auth.isLoading, 
    userEmail: auth.userEmail, 
    userRole: auth.userRole 
  });
  };

  // 4. Mostrar "Cargando..." mientras el contexto verifica localStorage
  if (auth.isLoading) {
    return (
      <header className="bg-gray-800 text-white shadow p-4 flex justify-between items-center">
         <div className="text-lg font-semibold">Sistema de Mercado</div>
         <span className="text-sm">Cargando...</span>
      </header>
    );
  }

  return (
    <header className="bg-gray-800 text-white shadow p-4 flex justify-between items-center">
      <div className="text-lg font-semibold">Sistema de Mercado</div>
      {auth.userEmail ? ( // 5. Leer directamente del contexto
        <div className="flex items-center gap-4">
          <span className="text-sm">
            {auth.userEmail} ({auth.userRole})
          </span>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm transition duration-150 ease-in-out"
          >
            Cerrar Sesión
          </button>
        </div>
      ) : (
        <Link href="/login">
          <span className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded text-sm transition duration-150 ease-in-out">
            Iniciar Sesión
          </span>
        </Link>
      )}
    </header>
  );
}