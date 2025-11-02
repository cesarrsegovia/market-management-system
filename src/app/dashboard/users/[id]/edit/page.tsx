// src/app/dashboard/users/[id]/edit/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import axios, { isAxiosError } from 'axios';
import Link from 'next/link';

// 1. Definimos las props que la página recibe de la URL
// interface EditUserPageProps {
//   params: {
//     id: string; // El [id] de la URL
//   };
// }

export default function EditUserPage() {
  
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  // 2. Estados para los datos del formulario
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'CASHIER'>('CASHIER');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // 3. useEffect para cargar los datos del usuario al inicio
  useEffect(() => {
    if (!id) return; // Guardia por si el id no está listo
    
    async function fetchUser() {
      try {
        const response = await axios.get(`/api/users/${id}`);
        const user = response.data;
        
        // Rellenamos el formulario con los datos existentes
        setEmail(user.email);
        setName(user.name ?? '');
        setRole(user.role);
        
      } catch (err) {
        console.error('Error al cargar el usuario', err);
        setError('No se pudo cargar el usuario.');
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchUser();
  }, [id]);

  // 4. Función para manejar el envío (actualización)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Llamamos a nuestra API PUT
      await axios.put(`/api/users/${id}`, {
        role: role, // Solo enviamos el rol, que es lo único editable
      });
      
      router.push('/dashboard/users'); // Volvemos a la lista
      
    } catch (err) {
      if (isAxiosError(err)) {
        setError(err.response?.data?.message || 'Error al actualizar');
      } else {
        setError('Ocurrió un error inesperado.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="container mx-auto p-4 text-gray-800">Cargando usuario...</div>;
  }

  // 5. El formulario
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Editar Usuario</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md max-w-lg">
        {error && <p className="text-red-500 mb-4">{error}</p>}
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={email}
            className="w-full px-3 py-2 border rounded bg-gray-200"
            disabled // No permitimos editar el email
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Nombre</label>
          <input
            type="text"
            value={name}
            className="w-full px-3 py-2 border rounded bg-gray-200"
            disabled // No permitimos editar el nombre (por ahora)
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Rol</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as 'ADMIN' | 'CASHIER')}
            className="w-full px-3 py-2 border rounded text-gray-800"
            required
          >
            <option value="CASHIER">Cajero (CASHIER)</option>
            <option value="ADMIN">Administrador (ADMIN)</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button 
            type="submit" 
            className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
          <Link href="/dashboard/users" className="flex-1">
            <button type="button" className="w-full bg-gray-500 text-white py-2 rounded hover:bg-gray-600">
              Cancelar
            </button>
          </Link>
        </div>
      </form>
    </div>
  );
}