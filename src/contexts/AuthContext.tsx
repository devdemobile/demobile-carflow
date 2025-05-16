import React, { createContext, useContext, useState, useEffect } from 'react';

import { SystemUser, LoginCredentials } from '@/types';
import { authService } from '@/services/auth/authService';

interface AuthContextValue {
  user: SystemUser | null;
  loading: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  login: async () => false,
  logout: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SystemUser | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Carregar dados do usuário do localStorage na inicialização
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error('Erro ao restaurar sessão:', error);
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Função de login
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setLoading(true);
    try {
      const userData = await authService.login(credentials);
      
      if (userData) {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return true;
      }
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Função de logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };
  
  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
