import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// 1. Definimos las rutas que queremos proteger
const protectedApiRoutes = [
  '/api/products/:path*',
  '/api/categories/:path*',
  '/api/sales/:path*',
  '/api/seed/:path*',
  '/api/users/:path*',
];
const protectedPageRoutes = ['/dashboard/:path*', '/point-of-sale'];

const adminOnlyApiRoutes = [
  '/api/users/:path*',
  '/api/seed/:path*',
];

export async function middleware(request: NextRequest) {
  // 2. Obtenemos el token de la cookie 'auth_token'
  const token = request.cookies.get('auth_token')?.value;
  const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

  let tokenPayload = null;
  let errorResponse = null;

  // 3. Verificamos si el token es válido
  if (!token) {
    errorResponse = { message: 'Autenticación requerida.', status: 401 };
  } else {
    try {
      const { payload } = await jwtVerify(token, secret);
      tokenPayload = payload; // Guardamos el payload completo
    } catch (error) {
      console.error('Error verificando el token JWT:', error);
      errorResponse = { message: 'Token inválido o expirado.', status: 401 };
    }
  }

  // 4. Decidimos qué hacer si hay un error
  const isApiRoute = protectedApiRoutes.some(route => new RegExp(route.replace(':path*', '.*')).test(request.nextUrl.pathname));
  const isPageRoute = protectedPageRoutes.some(route => new RegExp(route.replace(':path*', '.*')).test(request.nextUrl.pathname));

  if (errorResponse && (isApiRoute || isPageRoute)) {
    if (isApiRoute) {
      // Para rutas API, devolvemos un error JSON
      return NextResponse.json(errorResponse, { status: errorResponse.status });
    } else {
      // Para páginas (UI), redirigimos al login
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Esta lógica se ejecuta SOLO SI el token es válido (no hubo errorResponse)
  
  // Verificamos si es una acción de escritura (POST, PUT, DELETE)
  const isApiWriteAction = (request.method === 'POST' || request.method === 'PUT' || request.method === 'DELETE');
  const isAdminOnlyRoute = adminOnlyApiRoutes.some(route => new RegExp(route.replace(':path*', '.*')).test(request.nextUrl.pathname));
  // 2. Definimos qué requiere ser admin:
  // (Cualquier acción de escritura) O (Cualquier acceso a una ruta de admin)
  const requiresAdmin = (isApiRoute && isApiWriteAction) || isAdminOnlyRoute;
  // 3. Verificamos el permiso
  if (requiresAdmin && tokenPayload?.role !== 'ADMIN') {
    return NextResponse.json(
      { message: 'Acceso denegado: Se requiere rol de Administrador.' },
      { status: 403 } // 403 Forbidden
    );
  }
  // Si todo está bien, dejamos pasar la petición
  return NextResponse.next();
}

// 6. Configuración del matcher para que el middleware se ejecute en estas rutas
export const config = {
  matcher: [
    /* Rutas de API protegidas */
    '/api/products/:path*',
    '/api/categories/:path*',

    /* Rutas de páginas protegidas */
    '/dashboard/:path*',
    '/api/sales/:path*',
    '/api/seed/:path*',
    '/api/users/:path*',
    '/dashboard/:path*',
    '/point-of-sale',
  ],
};