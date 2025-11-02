// src/app/dashboard/users/new/page.tsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios, { isAxiosError } from 'axios';
import Link from 'next/link';

export default function NewUserPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'ADMIN' | 'CASHIER'>('CASHIER');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // 1. Llamar a la API que creamos
      await axios.post('/api/users', {
        email,
        name,
        password,
        role,
      });
      
      // 2. Redirigir a la lista (revalidatePath se encarga de refrescar)
      router.push('/dashboard/users'); 
      
    } catch (err) {
      if (isAxiosError(err)) {
        setError(err.response?.data?.message || 'Error al crear el usuario');
      } else {
        setError('Ocurrió un error inesperado.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">Crear Nuevo Usuario</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md max-w-lg">
        {error && <p className="text-red-500 mb-4">{error}</p>}
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded text-gray-800"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Nombre (Opcional)</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded text-gray-800"
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 mb-1">Contraseña</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded text-gray-800"
            required
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
            {isLoading ? 'Creando...' : 'Crear Usuario'}
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