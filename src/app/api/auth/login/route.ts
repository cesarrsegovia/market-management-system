import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { serialize } from 'cookie';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        //buscar al usuario por email
        const user = await prisma.user.findUnique({
            where: { email }
        });
        if (!user) {
            return NextResponse.json({ message: 'Credencial invalida' }, { status: 401 });
        }
        //comparar la pass
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return NextResponse.json({ message: 'Credencial invalida' }, { status: 401 });
        }
        //generar un token (jwt)
        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET!,
            { expiresIn: '1d' } //el token expira en 1 dia
        )
        // 3. Serializamos la cookie
        const cookie = serialize('auth_token', token, {
            httpOnly: true,      // La cookie no es accesible desde JavaScript en el navegador
            secure: process.env.NODE_ENV !== 'development', // Solo HTTPS en producción
            maxAge: 60 * 60 * 24, // 1 día (en segundos)
            path: '/',           // La cookie es válida para toda la web
            sameSite: 'strict',    // Protección contra ataques CSRF
        });

        // 4. Devolvemos una respuesta exitosa y añadimos el encabezado 'Set-Cookie'
        return NextResponse.json(
            { message: 'Login exitoso' },
            {
                status: 200,
                headers: { 'Set-Cookie': cookie },
            }
        );

    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Ocurrió un error en el servidor.' }, { status: 500 });
    }
}