# Sistema de Gestión de Mercado (Full-Stack)

Una aplicación web full-stack completa construida con Next.js 15 y Prisma, diseñada para simular el sistema de gestión de un mercado. Incluye autenticación basada en roles, gestión de inventario, un punto de venta (POS) y un dashboard de administración.

Este proyecto utiliza **TypeScript** en todo el stack y **ES Modules** para un desarrollo moderno y seguro.

---

## 🚀 Stack Tecnológico

Este proyecto está construido con un stack de tecnologías modernas, enfocado en el rendimiento y la seguridad de tipos (type-safety).

### Backend
* **Framework:** [Next.js 15](https://nextjs.org/) (Usando App Router y API Routes)
* **Lenguaje:** [TypeScript](https://www.typescriptlang.org/)
* **ORM:** [Prisma](https://www.prisma.io/) (Para una interacción type-safe con la base de datos)
* **Base de Datos:** [PostgreSQL](https://www.postgresql.org/)
* **Autenticación:** [JWT](https://jwt.io/) (con `jsonwebtoken` & `jose`)
* **Seguridad:** Cookies `HttpOnly` y encriptación de contraseñas con `bcryptjs`
* **Middleware:** Middleware de Next.js para la protección de rutas y autorización de roles.

### Frontend
* **Framework:** [React 19](https://react.dev/) (a través de Next.js 15)
* **Componentes:** React Server Components (RSC) y Client Components (`"use client";`)
* **Estilos:** [Tailwind CSS](https://tailwindcss.com/)
* **Cliente HTTP:** [Axios](https://axios-http.com/)
* **Gestión de Estado (Cliente):** React Context (`AuthContext`)
* **Utilidades:** `lucide-react` (iconos), `date-fns` (formateo de fechas)

---

## ✨ Características Principales

La aplicación se divide en dos roles de usuario principales: `ADMIN` y `CASHIER`.

### Autenticación y Seguridad
* **Registro de Usuario:** Endpoint de API para crear nuevos usuarios (`POST /api/auth/register`).
* **Login:** Endpoint que verifica credenciales, compara contraseñas hasheadas y emite un token JWT.
* **Gestión de Sesión:** El JWT se almacena de forma segura en una cookie **`HttpOnly`**.
* **Middleware de Protección:** Un "guardia" central (`middleware.ts`) que protege todas las páginas y APIs del dashboard/POS, redirigiendo a los usuarios no autenticados.
* **Autorización por Roles:** El middleware también verifica el rol del usuario, bloqueando acciones (`POST`, `PUT`, `DELETE`) y el acceso a rutas de API (`/api/users`) si el usuario no es `ADMIN`.

### Funcionalidad de Administrador (`ADMIN`)
* **Redirección Automática:** Al iniciar sesión, el `ADMIN` es redirigido al `/dashboard`.
* **Dashboard de Estadísticas:** Página principal que muestra tarjetas con datos en tiempo real (Ventas Totales, Total de Productos, Productos con Bajo Stock).
* **Gestión de Productos (CRUD):** Interfaz completa para Crear, Leer, Actualizar y Eliminar productos y su stock.
* **Gestión de Categorías:** API protegida para crear y listar categorías.
* **Gestión de Usuarios (CRUD):** Interfaz para ver todos los usuarios, crear nuevos (con rol) y editar el rol de usuarios existentes.
* **Historial de Ventas:** Página que muestra una tabla de todas las transacciones realizadas.
* **Seeding:** Endpoint protegido para poblar la base de datos con datos de prueba.

### Funcionalidad de Cajero (`CASHIER`)
* **Redirección Automática:** Al iniciar sesión, el `CASHIER` es redirigido al `/point-of-sale`.
* **Interfaz de Punto de Venta (POS):** Página interactiva para registrar ventas.
* **Catálogo de Productos:** Carga y muestra una lista de todos los productos disponibles con su stock actual.
* **Búsqueda de Productos:** Filtro en tiempo real.
* **Carrito de Compras:** Lógica de cliente para añadir productos, verificar el stock disponible e incrementar la cantidad.
* **Registro de Venta (Transacción Atómica):**
    * Al "Finalizar Venta", se llama a la API `POST /api/sales`.
    * El backend ejecuta una **transacción de Prisma** que:
        1.  Valida el stock de todos los productos del carrito.
        2.  Crea un registro `Sale` (el recibo).
        3.  Crea múltiples registros `SaleItem` (las líneas del recibo).
        4.  Descuenta la cantidad vendida del `Inventory` de cada producto.
    * Si el stock falla en *cualquier* producto, la transacción completa se revierte (`rollback`).

---

## ⚙️ Instalación y Puesta en Marcha

1.  **Clonar el repositorio:**
    ```bash
    git clone https://[URL-DE-TU-REPOSITORIO]
    cd market-management-system
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    ```

3.  **Configurar la Base de Datos:**
    * Asegúrate de tener PostgreSQL instalado y corriendo.
    * Crea una nueva base de datos (ej. `market_db`).

4.  **Configurar Variables de Entorno:**
    * Crea un archivo `.env` en la raíz del proyecto.
    * Añade las siguientes variables (ajusta la URL de la base de datos):
    ```ini
    DATABASE_URL="postgresql://[USUARIO]:[CONTRASEÑA]@localhost:5432/market_db?schema=public"
    JWT_SECRET="[TU_CLAVE_SECRETA_LARGA_Y_ALEATORIA_PARA_JWT]"
    ```

5.  **Ejecutar las Migraciones de Prisma:**
    * Este comando creará todas las tablas en tu base de datos basadas en el `schema.prisma`.
    ```bash
    npx prisma migrate dev
    ```

6.  **Correr la aplicación:**
    ```bash
    npm run dev
    ```

7.  **Acceder a la aplicación:**
    * Abre `http://localhost:3000` en tu navegador.
    * **Importante:** La primera vez, deberás crear un usuario usando **Thunder Client** o **Postman** en el endpoint `POST /api/auth/register`.
    * Para hacerte admin, usa `npx prisma studio` y cambia el rol de tu usuario a `ADMIN` manualmente.