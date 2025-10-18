import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
    //obtener el token del header
    const authHeader = request.headers.get('Authorization');
    const token = authHeader?.split(' ')[1]; //el token viene en el formato "Bearer
    if (!token) {
        return NextResponse.json({ message: 'No autorizado' }, { status: 401 });
    };
    try {
        //verificar el token
        const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
        await jwtVerify(token, secret);
        //si el token es valido, continuar
        return NextResponse.next();
    } catch (error) {
        console.error(error)
        //si el token no es valido, retornar 401
        return NextResponse.json({ message: 'Token invalido o expirado' }, { status: 401 });
    }
};

//configurar las rutas que requieren autenticacion
export const config = {
    matcher: [
        '/api/products/:path*', //proteger todas las rutas bajo /api/protected/
        '/api/categories/:path*',
    ],
};