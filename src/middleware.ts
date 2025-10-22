import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// 1. Definimos las rutas que queremos proteger
const protectedApiRoutes = ['/api/products/:path*', '/api/categories/:path*'];
const protectedPageRoutes = ['/dashboard/:path*'];

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
      tokenPayload = await jwtVerify(token, secret);
    } catch (error) {
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

  // 5. (Opcional pero recomendado) Añadir lógica de Roles/Autorización
  if (tokenPayload && isApiRoute) {
    // Aquí podríamos verificar el rol del usuario (ej. tokenPayload.role)
    // y denegar el acceso si no es 'ADMIN' para ciertas rutas POST/PUT/DELETE.
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
    '/dashboard/:path*'
  ],
};