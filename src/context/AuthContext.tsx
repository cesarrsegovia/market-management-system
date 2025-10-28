// src/context/AuthContext.tsx
"use client"; // El proveedor necesita ser un client component

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';

interface AuthContextType {
  userEmail: string | null;
  userRole: string | null;
  login: (email: string, role: string) => void;
  logout: () => void;
  isLoading: boolean; // Estado de carga inicial
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Empezamos cargando

  // Al inicio, intentar cargar desde localStorage
  useEffect(() => {
    const storedEmail = localStorage.getItem('userEmail');
    const storedRole = localStorage.getItem('userRole');
    if (storedEmail && storedRole) {
      setUserEmail(storedEmail);
      setUserRole(storedRole);
    }
    setIsLoading(false); // Terminamos de cargar
  }, []);

  const login = (email: string, role: string) => {
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userRole', role);
    setUserEmail(email);
    setUserRole(role);
    console.log('AuthContext: Estado actualizado ->', { email, role });
  };

  const logout = () => {
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRole');
    setUserEmail(null);
    setUserRole(null);
    // Aquí podríamos llamar a una API de logout para invalidar la cookie HttpOnly
  };

  return (
    <AuthContext.Provider value={{ userEmail, userRole, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto fácilmente
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};