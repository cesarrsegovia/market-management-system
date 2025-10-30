// src/lib/auth.ts
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import type { JWTPayload } from 'jose';

// Definimos la estructura de nuestro token
interface UserPayload extends JWTPayload {
  userId: number;
  email: string;
  role: string;
}

export async function getServerSideUser() {
  const tokenCookie = (await cookies()).get('auth_token');
  if (!tokenCookie) return null;

  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    // Verificamos y casteamos el payload a nuestro tipo
    const { payload } = await jwtVerify<UserPayload>(tokenCookie.value, secret);
    return payload;
  } catch (e) {
    console.error('Error verificando el token JWT en getServerSideUser:', e);
    return null;
  }
}