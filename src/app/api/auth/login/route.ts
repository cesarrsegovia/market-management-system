import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export async function POST(request: Request){
    try {
        const body = await request.json();
        const { email, password } = body;

        //buscar al usuario por email
        const user = await prisma.user.findUnique({
            where: { email }
        });
        if(!user){
            return NextResponse.json({ message: 'Credencial invalida' }, { status: 401 });
        }
        //comparar la pass
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid){
            return NextResponse.json({ message: 'Credencial invalida' }, { status: 401 });
        }
        //generar un token (jwt)
        const token = jwt.sign(
            { userId: user.id, email: user.email, role: user.role },
            process.env.JWT_SECRET!,
            { expiresIn: '1d' } //el token expira en 1 dia
        )
        //retornar el token
        return NextResponse.json({ token }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Error al iniciar sesion' }, { status: 500 });
    }
}