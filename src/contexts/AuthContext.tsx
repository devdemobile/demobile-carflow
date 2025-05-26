
import React, { createContext, useState, useEffect } from 'react';

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

/**
 * Provider component for authentication context
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SystemUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Carregar dados do usuário do localStorage na inicialização
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        console.log('Usuário restaurado do localStorage:', parsedUser);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error('Erro ao restaurar sessão:', error);
      localStorage.removeItem('user');
    } finally {
      setLoading(false);
    }
  }, []);
  
  /**
   * Login function that authenticates a user with credentials
   */
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      console.log('AuthContext: Iniciando processo de login para:', credentials.username);
      const userData = await authService.login(credentials);
      
      if (userData) {
        console.log('AuthContext: Login bem-sucedido, dados do usuário:', userData);
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        toast.success(`Bem-vindo, ${userData.name}!`);
        return true;
      }
      
      console.error('AuthContext: Login falhou - credenciais inválidas ou usuário inativo');
      setError('Credenciais inválidas');
      return false;
    } catch (err: any) {
      console.error('AuthContext: Erro no processo de login:', err);
      setError(err.message || 'Erro ao fazer login');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Logout function that clears the user session
   */
  const logout = () => {
    console.log('AuthContext: Fazendo logout');
    setUser(null);
    setError(null);
    localStorage.removeItem('user');
    toast.success('Logout realizado com sucesso');
  };

  /**
   * Function to switch the user's current unit
   */
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
