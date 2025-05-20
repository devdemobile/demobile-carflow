
import React, { createContext, useContext, useState, useEffect } from 'react';

import { SystemUser, LoginCredentials } from '@/types';
import { authService } from '@/services/auth/authService';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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
  
  // Configurar ouvinte para alterações de estado de autenticação
  useEffect(() => {
    // Configurar listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Mudança no estado de autenticação:", event);
        
        // Se deslogar, limpar o usuário atual
        if (event === 'SIGNED_OUT') {
          setUser(null);
          localStorage.removeItem('user');
        }
        
        // Se logar ou atualizar token, verificar se temos os dados do usuário
        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session) {
          // Buscar dados do usuário do localStorage para evitar chamada desnecessária
          const savedUser = localStorage.getItem('user');
          if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            if (parsedUser.id === session.user.id) {
              setUser(parsedUser);
            }
          }
        }
      }
    );
    
    // Carregar dados do usuário do localStorage na inicialização
    try {
      // Verificar se há sessão ativa do Supabase Auth
      const initAuth = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        console.log("Status da sessão na inicialização:", session ? "Autenticado" : "Não autenticado");
        
        // Se houver sessão mas não tiver usuário, restaurar do localStorage
        if (session) {
          const savedUser = localStorage.getItem('user');
          if (savedUser) {
            setUser(JSON.parse(savedUser));
          }
        }
        
        setLoading(false);
      };
      
      initAuth();
    } catch (error) {
      console.error('Erro ao restaurar sessão:', error);
      localStorage.removeItem('user');
      setLoading(false);
    }
    
    // Limpar subscription quando componente for desmontado
    return () => {
      subscription.unsubscribe();
    };
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
  const logout = async () => {
    try {
      // Deslogar do Supabase Auth
      await supabase.auth.signOut();
      // Limpar estado local
      setUser(null);
      localStorage.removeItem('user');
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      toast.error("Ocorreu um erro ao fazer logout");
    }
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
