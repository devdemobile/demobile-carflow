
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { SystemUser } from '@/types';
import { loginWithCredentials, switchUserUnit } from '@/services/auth/authService';

interface AuthContextType {
  user: SystemUser | null;
  loading: boolean;
  error: string | null;
  loginWithSystem: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  switchUnit: (unitId: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
  loginWithSystem: async () => false,
  logout: () => {},
  switchUnit: async () => false
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<SystemUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Verificar se há um usuário salvo no localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('carflow_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (err) {
        console.error('Erro ao carregar dados do usuário:', err);
        localStorage.removeItem('carflow_user');
      }
    }
    setLoading(false);
  }, []);
  
  // Login com sistema próprio
  const loginWithSystem = async (username: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    
    try {
      const loggedUser = await loginWithCredentials({ username, password });
      
      if (!loggedUser) {
        setError('Nome de usuário ou senha incorretos');
        setLoading(false);
        return false;
      }
      
      // Salvar no estado e localStorage
      setUser(loggedUser);
      localStorage.setItem('carflow_user', JSON.stringify(loggedUser));
      return true;
    } catch (err: any) {
      console.error('Erro ao fazer login:', err);
      setError(err.message || 'Ocorreu um erro ao fazer login');
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Logout
  const logout = () => {
    localStorage.removeItem('carflow_user');
    setUser(null);
  };
  
  // Trocar unidade do usuário
  const switchUnit = async (unitId: string): Promise<boolean> => {
    if (!user) return false;
    
    setLoading(true);
    try {
      const success = await switchUserUnit(user.id, unitId);
      
      if (success && user) {
        // Atualize apenas o ID da unidade e mantenha as outras informações
        const updatedUser = { ...user, unitId };
        setUser(updatedUser);
        localStorage.setItem('carflow_user', JSON.stringify(updatedUser));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Erro ao trocar unidade:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  const contextValue: AuthContextType = {
    user,
    loading,
    error,
    loginWithSystem,
    logout,
    switchUnit
  };
  
  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};
