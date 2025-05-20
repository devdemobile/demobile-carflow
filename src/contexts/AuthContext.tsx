import React, { createContext, useContext, useState, useEffect } from 'react';

import { SystemUser, LoginCredentials } from '@/types';
import { authService } from '@/services/auth/authService';
import { toast } from 'sonner';

interface AuthContextValue {
  user: SystemUser | null;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  switchUnit: (unitId: string) => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextValue>({
  user: null,
  loading: true,
  error: null,
  login: async () => false,
  logout: () => {},
  switchUnit: async () => false
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SystemUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
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
    setError(null);
    try {
      const userData = await authService.login(credentials);
      
      if (userData) {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return true;
      }
      setError('Credenciais inválidas');
      return false;
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login');
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

  // Função para trocar de unidade
  const switchUnit = async (unitId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      // No momento só atualizamos o estado local
      // Em uma implementação real, poderíamos validar no servidor
      const updatedUser = {
        ...user,
        unitId: unitId
      };
      
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      toast.success(`Unidade alterada com sucesso`);
      return true;
    } catch (err) {
      console.error('Erro ao trocar unidade:', err);
      toast.error('Erro ao trocar de unidade');
      return false;
    }
  };
  
  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, switchUnit }}>
      {children}
    </AuthContext.Provider>
  );
};
