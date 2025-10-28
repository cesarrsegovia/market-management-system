// src/app/point-of-sale/page.tsx
"use client";

import { useState, useEffect } from 'react';
import axios, { isAxiosError } from 'axios';

// 1. Definimos los tipos para Productos y Carrito
interface Product {
  id: number;
  name: string;
  price: number;
  inventory: { quantity: number } | null;
}

interface CartItem extends Product {
  quantityInCart: number;
}

export default function PointOfSalePage() {
  // 2. Estados para productos, carrito, búsqueda y errores
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingSale, setIsProcessingSale] = useState(false);

  // 3. Cargar productos al inicio
  useEffect(() => {
    async function fetchProducts() {
      setIsLoading(true);
      setError('');
      try {
        const response = await axios.get('/api/products');
        setProducts(response.data);
      } catch (err) {
        console.error("Error al cargar productos:", err);
        setError('No se pudieron cargar los productos.');
      } finally {
        setIsLoading(false);
      }
    }
    fetchProducts();
  }, []);

  // 4. Filtrar productos según la búsqueda
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 5. Función (vacía por ahora) para añadir al carrito
  const addToCart = (product: Product) => {
    console.log("Añadir al carrito:", product);
    // Lógica para añadir/incrementar cantidad en el estado 'cart'
  };

  // 6. Función (vacía por ahora) para finalizar la venta
  const handleCheckout = async () => {
    if (cart.length === 0) return; // No hacer nada si el carrito está vacío

    setError('');
    setIsProcessingSale(true); // 2. Indicar que la venta está en proceso

    try {
      // 3. Formatear los datos del carrito para la API
      const saleData = cart.map(item => ({
        productId: item.id,
        quantity: item.quantityInCart,
      }));

      // 4. Llamar a la API de ventas
      await axios.post('/api/sales', saleData);

      // 5. Si la venta es exitosa:
      setCart([]); // Limpiar el carrito
      alert('¡Venta registrada con éxito!'); // Mensaje simple de éxito
      // router.refresh(); // Opcional: Refrescar la lista de productos para ver el stock actualizado

    } catch (err) {
      console.error('Error al finalizar la venta:', err);
      if (isAxiosError(err)) {
        setError(err.response?.data?.message || 'Error al procesar la venta');
      } else {
        setError('Ocurrió un error inesperado.');
      }
    } finally {
      setIsProcessingSale(false); // 6. Quitar el indicador de carga
    }
  };

  // --- Renderizado del Componente ---
  return (
    <div className="container mx-auto p-4 grid grid-cols-3 gap-4 h-screen">
      
      {/* Columna Izquierda: Lista de Productos */}
      <div className="col-span-1 bg-white p-4 rounded shadow overflow-y-auto">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Productos Disponibles</h2>
        <input
          type="text"
          placeholder="Buscar producto..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-3 py-2 border rounded mb-4 placeholder-gray-600"
        />
        {isLoading && <p>Cargando productos...</p>}
        {error && <p className="text-red-500">{error}</p>}
        <ul>
          {filteredProducts.map((product) => (
            <li key={product.id} className="border-b py-2 flex justify-between items-center">
              <span className='text-gray-800'>{product.name} (${product.price.toFixed(2)}) - Stock: {product.inventory?.quantity ?? 0}</span>
              <button 
                onClick={() => addToCart(product)} 
                className="bg-blue-700 text-white px-2 py-1 rounded text-sm hover:bg-blue-600 disabled:opacity-50"
                disabled={!product.inventory || product.inventory.quantity <= 0}
              >
                Añadir
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Columna Derecha: Carrito y Checkout */}
      <div className="col-span-2 bg-white p-4 rounded shadow flex flex-col">
        <h2 className="text-xl font-bold mb-4 text-gray-800">Carrito de Compra</h2>
        <div className="flex-grow overflow-y-auto border-b mb-4">
          {/* Aquí mostraremos los items del carrito */}
          {cart.length === 0 && <p className="text-gray-500">El carrito está vacío.</p>}
          <ul>
            {cart.map((item) => (
               <li key={item.id} className="py-2 flex justify-between items-center">
                 <span className='text-gray-800'>{item.quantityInCart} x {item.name} (${(item.price * item.quantityInCart).toFixed(2)})</span>
                 {/* Aquí irían botones para +/- cantidad o eliminar */}
               </li>
            ))}
          </ul>
        </div>
        <div className="text-right">
          {/* Aquí mostraremos el total */}
          <p className="text-xl font-bold mb-4 text-gray-800">Total: $0.00</p> 
          <button
            onClick={handleCheckout}
            className="bg-green-500 text-white px-6 py-2 rounded text-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed" // Añadido disabled:cursor-not-allowed
            disabled={cart.length === 0 || isProcessingSale} // Deshabilitado si el carrito está vacío O si se está procesando
          >
            {isProcessingSale ? 'Procesando...' : 'Finalizar Venta'} {/* Cambia el texto mientras carga */}
          </button>
        </div>
      </div>
    </div>
  );
}