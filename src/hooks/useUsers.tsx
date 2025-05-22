
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { SystemUser, UserStatus } from '@/types/entities';
import { toast } from 'sonner';
import { handleSupabaseRequest } from '@/services/api/supabase';

export interface Unit {
  id: string;
  name: string;
}

export const useUsers = () => {
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);

  // Carregar usuários e unidades
  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: usersData, error: usersError } = await supabase
          .from('system_users')
          .select('*, units(name)')
          .order('created_at', { ascending: false });
        
        const { data: unitsData, error: unitsError } = await supabase
          .from('units')
          .select('id, name')
          .order('name');

        if (usersError) {
          throw new Error(`Erro ao buscar usuários: ${usersError.message}`);
        }

        if (unitsError) {
          throw new Error(`Erro ao buscar unidades: ${unitsError.message}`);
        }

        // Map database users to SystemUser type
        const mappedUsers: SystemUser[] = usersData ? usersData.map((dbUser: any) => ({
          id: dbUser.id,
          name: dbUser.name,
          username: dbUser.username,
          email: dbUser.email || undefined,
          role: dbUser.role,
          shift: dbUser.shift,
          status: dbUser.status,
          unitId: dbUser.unit_id,
          unit_id: dbUser.unit_id, // Keep for compatibility
          unitName: dbUser.units?.name,
          units: dbUser.units // Keep for compatibility
        })) : [];

        setUsers(mappedUsers);
        setUnits(unitsData || []);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        toast.error('Não foi possível carregar os usuários');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleUserStatus = async (userId: string, currentStatus: UserStatus): Promise<boolean> => {
    try {
      const newStatus: UserStatus = currentStatus === 'active' ? 'inactive' : 'active';
      
      const { error } = await supabase
        .from('system_users')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);
      
      if (error) throw error;
      
      // Atualizar o estado local
      setUsers(prevUsers => prevUsers.map(user => 
        user.id === userId ? { ...user, status: newStatus } : user
      ));
      
      toast.success(
        newStatus === 'active' 
          ? 'Usuário ativado com sucesso' 
          : 'Usuário desativado com sucesso'
      );
      
      return true;
    } catch (error: any) {
      console.error('Erro ao alternar status:', error);
      toast.error('Não foi possível alterar o status do usuário');
      return false;
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('system_users')
        .delete()
        .eq('id', userId);
      
      if (error) throw error;
      
      // Atualizar o estado local
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      toast.success('Usuário excluído com sucesso');
      return true;
      
    } catch (error: any) {
      console.error('Erro ao excluir usuário:', error);
      toast.error('Não foi possível excluir o usuário');
      return false;
    }
  };
  
  // Recarregar os usuários quando necessário
  const refreshUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('system_users')
        .select('*, units(name)')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      if (data) {
        // Map to SystemUser type
        const mappedUsers: SystemUser[] = data.map((dbUser: any) => ({
          id: dbUser.id,
          name: dbUser.name,
          username: dbUser.username,
          email: dbUser.email || undefined,
          role: dbUser.role,
          shift: dbUser.shift,
          status: dbUser.status,
          unitId: dbUser.unit_id,
          unit_id: dbUser.unit_id,
          unitName: dbUser.units?.name,
          units: dbUser.units
        }));
        
        setUsers(mappedUsers);
      }
    } catch (error) {
      console.error('Erro ao recarregar usuários:', error);
      toast.error('Não foi possível atualizar a lista de usuários');
    } finally {
      setLoading(false);
    }
  };

  return {
    users,
    units,
    loading,
    toggleUserStatus,
    deleteUser,
    refreshUsers,
    setUsers,
  };
};

export default useUsers;
