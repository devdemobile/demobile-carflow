
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Session } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';

export type UserRole = 'admin' | 'operator';
export type UserShift = 'day' | 'night';
export type UserStatus = 'active' | 'inactive';

export interface SystemUser {
  id: string;
  name: string;
  username: string;
  email?: string;
  role: UserRole;
  shift: UserShift;
  unitId: string;
  unitName: string;
  status: UserStatus;
  permissions?: {
    canViewVehicles: boolean;
    canEditVehicles: boolean;
    canViewUnits: boolean;
    canEditUnits: boolean;
    canViewUsers: boolean;
    canEditUsers: boolean;
    canViewMovements: boolean;
    canEditMovements: boolean;
  };
}

interface AuthContextType {
  user: SystemUser | null;
  loading: boolean;
  loginWithSystem: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  switchUnit: (unitId: string, password?: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  loginWithSystem: async () => false,
  logout: () => {},
  switchUnit: async () => false,
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<SystemUser | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Verificar login existente no localStorage
  useEffect(() => {
    const checkUserSession = async () => {
      try {
        const storedUser = localStorage.getItem('carflow_user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          // Verificar se o token ainda é válido
          const { data, error } = await supabase
            .rpc('verify_password', {
              username: userData.username,
              password_attempt: localStorage.getItem('carflow_token') || '',
            });

          if (data && !error) {
            setUser(userData);
          } else {
            // Token inválido, limpar localStorage
            console.log("Sessão inválida, limpando dados");
            localStorage.removeItem('carflow_user');
            localStorage.removeItem('carflow_token');
          }
        }
      } catch (error) {
        console.error('Erro ao verificar sessão:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUserSession();
  }, []);

  const loginWithSystem = async (username: string, password: string): Promise<boolean> => {
    try {
      console.log("LoginWithSystem chamado para usuário:", username);
      
      // Verificar credenciais usando RPC do Supabase
      const { data: userId, error } = await supabase.rpc('verify_password', {
        username,
        password_attempt: password,
      });

      if (error) {
        console.error("Erro RPC verify_password:", error);
        toast({
          title: 'Erro no login',
          description: 'Nome de usuário ou senha incorretos.',
          variant: 'destructive',
        });
        return false;
      }
      
      if (!userId) {
        console.log("Usuário ou senha incorretos (userId vazio)");
        toast({
          title: 'Erro no login',
          description: 'Nome de usuário ou senha incorretos.',
          variant: 'destructive',
        });
        return false;
      }
      
      console.log("Usuário autenticado com ID:", userId);

      // Obter dados do usuário
      const { data: userData, error: userError } = await supabase
        .from('system_users')
        .select('*, units(name)')
        .eq('id', userId)
        .single();

      if (userError) {
        console.error("Erro ao buscar dados do usuário:", userError);
        toast({
          title: 'Erro no login',
          description: 'Erro ao carregar dados do usuário.',
          variant: 'destructive',
        });
        return false;
      }
      
      if (!userData) {
        console.log("Dados do usuário não encontrados");
        toast({
          title: 'Erro no login',
          description: 'Dados do usuário não encontrados.',
          variant: 'destructive',
        });
        return false;
      }
      
      console.log("Dados do usuário carregados:", userData);

      // Obter permissões do usuário
      const { data: permissions, error: permissionsError } = await supabase
        .from('system_user_permissions')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (permissionsError && !permissionsError.message.includes('No rows found')) {
        console.error('Erro ao carregar permissões:', permissionsError);
      }
      
      console.log("Permissões carregadas:", permissions);

      // Montar objeto do usuário autenticado
      const systemUser: SystemUser = {
        id: userData.id,
        name: userData.name,
        username: userData.username,
        email: userData.email,
        role: userData.role,
        shift: userData.shift,
        unitId: userData.unit_id,
        unitName: userData.units?.name || '',
        status: userData.status,
        permissions: permissions ? {
          canViewVehicles: permissions.can_view_vehicles,
          canEditVehicles: permissions.can_edit_vehicles,
          canViewUnits: permissions.can_view_units,
          canEditUnits: permissions.can_edit_units,
          canViewUsers: permissions.can_view_users,
          canEditUsers: permissions.can_edit_users,
          canViewMovements: permissions.can_view_movements,
          canEditMovements: permissions.can_edit_movements,
        } : undefined
      };
      
      console.log("Objeto de usuário criado:", systemUser);

      // Guardar usuário e token no localStorage
      localStorage.setItem('carflow_user', JSON.stringify(systemUser));
      localStorage.setItem('carflow_token', password); // Poderia ser um token JWT, mas por simplicidade usamos a senha

      setUser(systemUser);
      
      // Registrar atividade
      await supabase.from('activity_logs').insert({
        user_id: systemUser.id,
        action: 'login',
        table_name: 'system_users',
        record_id: systemUser.id,
        details: {
          username: systemUser.username,
          date: new Date().toISOString()
        }
      });

      return true;
    } catch (error) {
      console.error('Erro inesperado no login:', error);
      toast({
        title: 'Erro no login',
        description: 'Ocorreu um erro inesperado. Tente novamente.',
        variant: 'destructive',
      });
      return false;
    }
  };

  const logout = async () => {
    try {
      if (user) {
        // Registrar atividade
        await supabase.from('activity_logs').insert({
          user_id: user.id,
          action: 'logout',
          table_name: 'system_users',
          record_id: user.id,
          details: {
            username: user.username,
            date: new Date().toISOString()
          }
        });
      }
      
      // Limpar localStorage e estado do usuário
      localStorage.removeItem('carflow_user');
      localStorage.removeItem('carflow_token');
      setUser(null);
    } catch (error) {
      console.error('Erro ao sair:', error);
      toast({
        title: 'Erro ao sair',
        description: 'Ocorreu um erro ao tentar sair. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const switchUnit = async (unitId: string, password?: string): Promise<boolean> => {
    if (!user) return false;

    try {
      // Verificar senha se usuário não for admin
      if (user.role !== 'admin' && password) {
        const { data, error } = await supabase.rpc('verify_password', {
          username: user.username,
          password_attempt: password,
        });

        if (!data || error) {
          toast({
            title: 'Senha incorreta',
            description: 'A senha fornecida está incorreta.',
            variant: 'destructive',
          });
          return false;
        }
      }

      // Obter o nome da unidade
      const { data: unit, error: unitError } = await supabase
        .from('units')
        .select('name')
        .eq('id', unitId)
        .single();

      if (unitError) {
        throw unitError;
      }

      // Atualizar unidade do usuário no banco de dados
      const { error: updateError } = await supabase
        .from('system_users')
        .update({ unit_id: unitId })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      // Registrar troca de unidade
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        action: 'unit_switch',
        table_name: 'system_users',
        record_id: user.id,
        details: {
          previous_unit_id: user.unitId,
          previous_unit_name: user.unitName,
          new_unit_id: unitId,
          new_unit_name: unit.name
        }
      });

      // Atualizar estado e localStorage
      const updatedUser = { 
        ...user, 
        unitId, 
        unitName: unit.name 
      };
      
      setUser(updatedUser);
      localStorage.setItem('carflow_user', JSON.stringify(updatedUser));

      toast({
        title: 'Unidade alterada',
        description: `Você agora está na unidade ${unit.name}`,
      });
      
      return true;
    } catch (error) {
      console.error('Erro ao trocar de unidade:', error);
      toast({
        title: 'Erro ao trocar de unidade',
        description: 'Ocorreu um erro ao trocar de unidade. Tente novamente.',
        variant: 'destructive',
      });
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithSystem, logout, switchUnit }}>
      {children}
    </AuthContext.Provider>
  );
};
