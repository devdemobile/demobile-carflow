
/**
 * Repositório para gerenciamento de usuários
 */
import { supabase } from '@/integrations/supabase/client';
import { SystemUser, UserPermissions, UserStatus } from '@/types/entities';
import { handleSupabaseRequest } from '@/services/api/supabase';
import { toast } from 'sonner';
import { UserDTO, UserPermissionsResponse } from '@/types/user.types';
import { UserMapper } from './userMapper';

/**
 * Interface para o repositório de usuários
 */
export interface IUserRepository {
  getUserById(id: string): Promise<SystemUser | null>;
  updateUserPassword(userId: string, newPassword: string): Promise<boolean>;
  updateUserPermissions(userId: string, permissions: any): Promise<boolean>;
}

/**
 * Implementação do repositório de usuários
 */
export class UserRepository implements IUserRepository {
  /**
   * Busca um usuário pelo ID
   */
  async getUserById(id: string): Promise<SystemUser | null> {
    const { data, error } = await supabase
      .from('system_users')
      .select('*, units(name)')
      .eq('id', id)
      .single();
    
    if (error || !data) {
      console.error('Erro ao buscar usuário:', error);
      return null;
    }
    
    return {
      id: data.id,
      name: data.name,
      username: data.username,
      email: data.email || undefined,
      role: data.role,
      shift: data.shift,
      status: data.status,
      unitId: data.unit_id,
      unitName: data.units?.name,
    };
  }

  /**
   * Atualiza a senha de um usuário
   */
  async updateUserPassword(userId: string, newPassword: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('system_users')
        .update({ 
          password_hash: newPassword,
          updated_at: new Date().toISOString() 
        })
        .eq('id', userId);
      
      if (error) {
        console.error('Erro ao atualizar senha:', error);
        toast.error('Não foi possível atualizar a senha');
        return false;
      }
      
      return true;
    } catch (error: any) {
      console.error('Exceção ao atualizar senha:', error.message);
      toast.error('Erro ao processar a solicitação');
      return false;
    }
  }

  /**
   * Atualiza as permissões de um usuário
   * Recebe um objeto com as permissões em snake_case para compatibilidade com o BD
   */
  async updateUserPermissions(userId: string, permissions: any): Promise<boolean> {
    try {
      // Verificar se já existe registro de permissões
      const { data: existingPermissions, error: checkError } = await supabase
        .from('system_user_permissions')
        .select('user_id')
        .eq('user_id', userId)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = not found
        console.error('Erro ao verificar permissões existentes:', checkError);
        toast.error('Erro ao verificar permissões existentes');
        return false;
      }
      
      let result;
      
      // Se já existe registro, atualize
      if (existingPermissions) {
        result = await supabase
          .from('system_user_permissions')
          .update({
            ...permissions,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);
      } else {
        // Caso contrário, insira novo registro
        result = await supabase
          .from('system_user_permissions')
          .insert({
            user_id: userId,
            ...permissions
          });
      }
      
      if (result.error) {
        console.error('Erro ao atualizar permissões:', result.error);
        toast.error('Não foi possível atualizar as permissões');
        return false;
      }
      
      return true;
    } catch (error: any) {
      console.error('Exceção ao atualizar permissões:', error.message);
      toast.error('Erro ao processar a solicitação');
      return false;
    }
  }
}

/**
 * Instância singleton do repositório
 */
export const userRepository = new UserRepository();
