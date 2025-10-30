import prisma from '@/lib/prisma';
import { format } from 'date-fns';

// Esta página es un Server Component, pero la protegeremos en el layout.
// Por ahora, buscará los datos directamente.

async function getUsers() {
  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  return users;
}

export default async function UsersPage() {
  const users = await getUsers();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Gestión de Usuarios</h1>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="py-2 px-4 text-left">Email</th>
              <th className="py-2 px-4 text-left">Nombre</th>
              <th className="py-2 px-4 text-left">Rol</th>
              <th className="py-2 px-4 text-left">Fecha Creación</th>
              <th className="py-2 px-4 text-left">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b hover:bg-gray-50">
                <td className="py-2 px-4 text-black">{user.email}</td>
                <td className="py-2 px-4 text-black">{user.name ?? 'N/A'}</td>
                <td className="py-2 px-4 text-black">{user.role}</td>
                <td className="py-2 px-4 text-black">
                  {format(new Date(user.createdAt), 'dd/MM/yyyy')}
                </td>
                <td className="py-2 px-4">
                  <button className="text-blue-500 hover:underline">Editar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}