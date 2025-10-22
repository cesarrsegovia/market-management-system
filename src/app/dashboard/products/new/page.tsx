// src/app/dashboard/products/new/page.tsx
"use client"; // ¡Muy importante para la interactividad!

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios, { isAxiosError } from 'axios';

// 1. Definimos el tipo para nuestras categorías
interface Category {
  id: number;
  name: string;
}

export default function NewProductPage() {
  // 2. Estados para el formulario y las categorías
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState('');
  
  const router = useRouter();

  // 3. useEffect para cargar las categorías cuando el componente se monta
  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await axios.get('/api/categories');
        setCategories(response.data);
      } catch (err) {
        console.error('Error al cargar categorías', err);
        setError('No se pudieron cargar las categorías.');
      }
    }
    fetchCategories();
  }, []); // El array vacío significa que solo se ejecuta una vez

  // 4. Función para manejar el envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await axios.post('/api/products', {
        name,
        description,
        price: parseFloat(price), // Convertimos el precio a número
        categoryId: parseInt(categoryId), // Convertimos el ID a número
      });
      
      
      // Si tiene éxito, redirigimos de vuelta a la lista
      router.push('/dashboard/products');
    } catch (err) {
      if (isAxiosError(err)) {
        setError(err.response?.data?.message || 'Error al crear el producto');
      } else {
        setError('Ocurrió un error inesperado.');
      }
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Crear Nuevo Producto</h1>
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md max-w-lg">
        {error && <p className="text-red-500 mb-4">{error}</p>}
        
        {/* ... (campos del formulario) ... */}
        <div className="mb-4">
          <label className="block mb-1">Nombre del Producto</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1">Descripción</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1">Precio</label>
          <input
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1">Categoría</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full px-3 py-2 border rounded"
            required
          >
            <option value="" disabled>Selecciona una categoría</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <button 
          type="submit" 
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          Crear Producto
        </button>
      </form>
    </div>
  );
}