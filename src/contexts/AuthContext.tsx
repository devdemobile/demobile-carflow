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

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

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
      console.log("Iniciando login para:", credentials.username);
      
      // Usando o serviço de autenticação atualizado
      const userData = await authService.login(credentials);
      
      if (userData) {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
        return true;
      }
      
      setError('Credenciais inválidas');
      return false;
    } catch (err: any) {
      console.error("Erro no processo de login:", err);
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
      const updatedUser = await authService.switchUnit(user.id, unitId);
      if (updatedUser) {
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return true;
      }
      return false;
    } catch (err: any) {
      console.error("Erro ao trocar de unidade:", err);
      toast.error(err.message || 'Erro ao trocar de unidade');
      return false;
    }
  };
  
  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout, switchUnit }}>
      {children}
    </AuthContext.Provider>
  );
};
