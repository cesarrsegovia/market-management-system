// src/app/dashboard/products/[id]/edit/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios, { isAxiosError } from 'axios';
import Link from 'next/link';

interface Category {
  id: number;
  name: string;
}

// 1. Definimos las props: Next.js nos pasará 'params'
interface EditProductPageProps {
  params: {
    id: string; // El [id] de la URL
  };
}

export default function EditProductPage({ params }: EditProductPageProps) {
  const { id } = params;
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
  const router = useRouter();

  // 2. useEffect para cargar los datos del producto Y las categorías
  useEffect(() => {
    console.log('ID recibido por la página:', id);
    if (!id) {
        console.log('Esperando por el ID...');
        return;
    }
    async function fetchData() {
      try {
        // Hacemos ambas peticiones al mismo tiempo
        const [productRes, categoriesRes] = await Promise.all([
          axios.get(`/api/products/${id}`),
          axios.get('/api/categories')
        ]);

        // Pre-rellenamos el formulario con los datos del producto
        const product = productRes.data;
        setName(product.name);
        setDescription(product.description || '');
        setPrice(product.price.toString());
        setCategoryId(product.categoryId.toString());
        
        // Cargamos las categorías en el <select>
        setCategories(categoriesRes.data);
      } catch (err) {
        console.error('ERROR DETALLADO AL CARGAR DATOS:', err);
        if (isAxiosError(err)) {
          // Si es un error de Axios, nos dará más información
          console.error('Respuesta del servidor (error de Axios):', err.response?.data);
          setError(`Error de API: ${err.response?.status} - ${err.response?.data?.message || 'Error desconocido'}`);
        } else {
          setError('Ocurrió un error inesperado al procesar los datos.');
        }
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [id]); // Se ejecuta si el 'id' cambia

  // 3. Función para manejar el envío (actualización)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // Usamos el método PUT en la API que creamos
      await axios.put(`/api/products/${id}`, {
        name,
        description,
        price: parseFloat(price),
        categoryId: parseInt(categoryId),
      });
      
      router.push('/dashboard/products'); // Volvemos a la lista
      router.refresh(); // Forzamos el refresco del Server Component
    } catch (err) {
      if (isAxiosError(err)) {
        setError(err.response?.data?.message || 'Error al actualizar');
      } else {
        setError('Ocurrió un error inesperado.');
      }
    }
  };

  if (isLoading) {
    return <div className="container mx-auto p-4">Cargando datos del producto...</div>;
  }

  // 4. El formulario (similar a 'new', pero con 'value' en los campos)
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Editar Producto</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md max-w-lg">
        {error && <p className="text-red-500 mb-4">{error}</p>}
        
        <div className="mb-4">
          <label className="block mb-1">Nombre</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded" required />
        </div>

        <div className="mb-4">
          <label className="block mb-1">Descripción</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border rounded" />
        </div>

        <div className="mb-4">
          <label className="block mb-1">Precio</label>
          <input type="number" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)}
            className="w-full px-3 py-2 border rounded" required />
        </div>

        <div className="mb-4">
          <label className="block mb-1">Categoría</label>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-3 py-2 border rounded" required >
            <option value="" disabled>Selecciona una categoría</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <button type="submit" className="flex-1 bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
            Guardar Cambios
          </button>
          <Link href="/dashboard/products" className="flex-1">
            <button type="button" className="w-full bg-gray-500 text-white py-2 rounded hover:bg-gray-600">
              Cancelar
            </button>
          </Link>
        </div>
      </form>
    </div>
  );
}