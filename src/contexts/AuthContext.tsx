import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { Database } from '@/integrations/supabase/types';

export type UserRole = 'admin' | 'operator';
export type UserShift = 'day' | 'night';
export type UserStatus = 'active' | 'inactive';

export interface AppUser {
  id: string;
  name: string;
  username: string;
  email: string;
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
  };
}

interface AuthContextType {
  user: AppUser | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  switchUnit: (unitId: string, password?: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: async () => false,
  logout: () => {},
  switchUnit: async () => false,
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Check for existing session on component mount
  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        if (session?.user) {
          // Delay fetching user profile to avoid potential deadlock
          setTimeout(() => {
            fetchUserProfile(session.user.id);
          }, 0);
        } else {
          setUser(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      // Fetch user profile data
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*, units(name)')
        .eq('id', userId)
        .single();

      if (profileError) {
        throw profileError;
      }

      // Fetch user permissions
      const { data: permissions, error: permissionsError } = await supabase
        .from('user_permissions')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (permissionsError) {
        console.error('Error fetching permissions:', permissionsError);
      }

      if (profile) {
        setUser({
          id: profile.id,
          name: profile.name,
          username: profile.username,
          email: profile.email,
          role: profile.role,
          shift: profile.shift,
          unitId: profile.unit_id,
          unitName: profile.units?.name || '',
          status: profile.status,
          permissions: permissions ? {
            canViewVehicles: permissions.can_view_vehicles,
            canEditVehicles: permissions.can_edit_vehicles,
            canViewUnits: permissions.can_view_units,
            canEditUnits: permissions.can_edit_units,
            canViewUsers: permissions.can_view_users,
            canEditUsers: permissions.can_edit_users,
          } : undefined
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error:', error.message);
        toast({
          title: 'Erro no login',
          description: error.message,
          variant: 'destructive',
        });
        return false;
      }

      // Auth state change will handle setting the user
      return true;
    } catch (error) {
      console.error('Unexpected login error:', error);
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
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      // onAuthStateChange will handle clearing the user
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: 'Erro ao sair',
        description: 'Ocorreu um erro ao tentar sair. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const switchUnit = async (unitId: string, password?: string) => {
    if (!user) return false;

    try {
      // Verify password if user is not an admin
      if (user.role !== 'admin' && password) {
        const { error } = await supabase.auth.signInWithPassword({
          email: user.email,
          password,
        });

        if (error) {
          toast({
            title: 'Senha incorreta',
            description: 'A senha fornecida está incorreta.',
            variant: 'destructive',
          });
          return false;
        }
      }

      // Fetch the unit name
      const { data: unit, error: unitError } = await supabase
        .from('units')
        .select('name')
        .eq('id', unitId)
        .single();

      if (unitError) {
        throw unitError;
      }

      // Update the user's unit in the database
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ unit_id: unitId })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      // Log the unit switch
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        action: 'unit_switch',
        table_name: 'profiles',
        record_id: user.id,
        details: {
          previous_unit_id: user.unitId,
          previous_unit_name: user.unitName,
          new_unit_id: unitId,
          new_unit_name: unit.name
        }
      });

      // Update the user state
      setUser(prev => prev ? {
        ...prev,
        unitId,
        unitName: unit.name
      } : null);

      toast({
        title: 'Unidade alterada',
        description: `Você agora está na unidade ${unit.name}`,
      });
      
      return true;
    } catch (error) {
      console.error('Error switching unit:', error);
      toast({
        title: 'Erro ao trocar de unidade',
        description: 'Ocorreu um erro ao trocar de unidade. Tente novamente.',
        variant: 'destructive',
      });
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, switchUnit }}>
      {children}
    </AuthContext.Provider>
  );
};
