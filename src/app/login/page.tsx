// src/app/login/page.tsx
"use client"; // 1. ¡Esto es muy importante!

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios, { isAxiosError } from 'axios';
import { useAuth } from '@/context/AuthContext';


export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth();
  const router = useRouter(); // 2. Para redirigir al usuario

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // La llamada de Axios devuelve el objeto de respuesta
      const response = await axios.post('/api/auth/login', { email, password });
      console.log('LoginPage: Datos recibidos de la API ->', response.data);

      // --- CORRECCIÓN ---
      // Leer email y role directamente de response.data
      const userEmailFromApi = response.data.email;
      const userRoleFromApi = response.data.role;

      // Verificar que ambos existan en la respuesta
      if (userEmailFromApi && userRoleFromApi) {
        console.log('LoginPage: Llamando a auth.login con:', { email: userEmailFromApi, role: userRoleFromApi });
        auth.login(userEmailFromApi, userRoleFromApi); // Actualizar contexto
        console.log('LoginPage: auth.login llamado.');
        if (userRoleFromApi === 'ADMIN') {
          console.log('Redirigiendo a /dashboard (ADMIN)');
          router.push('/dashboard');
        } else if (userRoleFromApi === 'CASHIER') {
          console.log('Redirigiendo a /point-of-sale (CASHIER)');
          window.location.href = '/point-of-sale';
        } else {
          console.log('Redirigiendo a / (DEFAULT)');
          router.push('/');
        }
      } else {
        // Este error ya no debería ocurrir si la API envía email y role
        console.error("LoginPage: Email o Role no encontrados en la respuesta directa.");
        setError("Error al procesar la información del usuario desde la API.");
      }

      // Si axios NO da error, sabemos que el login fue exitoso
      router.push('/dashboard/products');

    } catch (err) {
      if (isAxiosError(err)) {
        // 'err.response.data' es el JSON que manda la API ({ message: "..." })
        setError(err.response?.data?.message || 'Error al iniciar sesión');
      } else {
        setError('Ocurrió un error inesperado.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Iniciar Sesión</h1> {/* Texto más oscuro */}
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email</label> {/* Texto más oscuro */}
            <input
              type="email"
              id="email"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-800 leading-tight focus:outline-none focus:shadow-outline placeholder-gray-500" // Texto y placeholder oscuro
              placeholder="tu@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">Contraseña</label> {/* Texto más oscuro */}
            <input
              type="password"
              id="password"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-800 mb-3 leading-tight focus:outline-none focus:shadow-outline placeholder-gray-500" // Texto y placeholder oscuro
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full transition duration-150 ease-in-out" // Botón con color y hover
              disabled={isLoading}
            >
              {isLoading ? 'Cargando...' : 'Entrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}