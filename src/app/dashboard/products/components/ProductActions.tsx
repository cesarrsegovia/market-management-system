// src/app/dashboard/products/components/ProductActions.tsx
"use client"; // 1. Componente interactivo

import { useRouter } from 'next/navigation';
import axios from 'axios';
import Link from 'next/link'

// 2. Definimos las propiedades que recibirá el componente
interface ProductActionsProps {
  productId: number;
}

export default function ProductActions({ productId }: ProductActionsProps) {
  const router = useRouter();

  const handleDelete = async () => {
    // 3. Pedimos confirmación antes de borrar
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      try {
        await axios.delete(`/api/products/${productId}`);
        
        
      } catch (error) {
        console.error('Error al eliminar el producto', error);
        alert('No se pudo eliminar el producto.');
      }
    }
  };

  return (
    <>
      <Link href={`/dashboard/products/${productId}/edit`}>
        <button className="text-blue-500 hover:underline mr-2">
          Editar
        </button>
      </Link>
      <button 
        onClick={handleDelete} // 5. Conectamos la función
        className="text-red-500 hover:underline"
      >
        Eliminar
      </button>
    </>
  );
}