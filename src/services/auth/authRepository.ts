
import { supabase } from '@/integrations/supabase/client';
import { SystemUser } from '@/types/entities';
import { LoginCredentials } from '@/types/dto';
import { toast } from 'sonner';
import { callRPC } from '../api/supabase';

/**
 * Interface para o repositório de autenticação
 */
export interface IAuthRepository {
  login(credentials: LoginCredentials): Promise<string | null>;
  getUserData(userId: string): Promise<SystemUser | null>;
}

/**
 * Implementação do repositório de autenticação
 */
export class AuthRepository implements IAuthRepository {
  /**
   * Realiza autenticação com credenciais
   * @returns ID do usuário se autenticação bem-sucedida, null caso contrário
   */
  async login(credentials: LoginCredentials): Promise<string | null> {
    const { username, password } = credentials;
    
    try {
      console.log('Verificando credenciais para usuário:', username);
      
      const userId = await callRPC<
        { username_input: string, password_attempt: string },
        string
      >('verify_password', 
        { username_input: username, password_attempt: password }, 
        'Falha na autenticação'
      );
      
      console.log('Resposta da função verify_password:', userId);
      
      if (!userId) {
        console.log('Autenticação falhou: função retornou null/undefined');
        return null;
      }
      
      console.log('Autenticação bem-sucedida para o usuário ID:', userId);
      return userId;
    } catch (error: any) {
      console.error('Erro ao verificar credenciais:', error);
      toast.error('Erro ao verificar credenciais');
      return null;
    }
  }
  
  /**
   * Busca dados do usuário pelo ID
   */
  async getUserData(userId: string): Promise<SystemUser | null> {
    try {
      console.log('Buscando dados do usuário ID:', userId);
      
      const { data: userData, error } = await supabase
        .from('system_users')
        .select(`
          *,
          units(name),
          system_user_permissions(*)
        `)
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Erro ao buscar dados do usuário:', error);
        toast.error('Erro ao buscar dados do usuário');
        return null;
      }
      
      if (!userData) {
        console.log('Usuário não encontrado para ID:', userId);
        toast.error('Usuário não encontrado');
        return null;
      }
      
      console.log('Dados do usuário encontrados:', userData);
      
      // Mapear para objeto SystemUser
      const systemUser: SystemUser = {
        id: userData.id,
        name: userData.name,
        username: userData.username,
        email: userData.email || undefined,
        role: userData.role,
        shift: userData.shift,
        status: userData.status,
        unitId: userData.unit_id,
        unitName: userData.units?.name,
        permissions: userData.system_user_permissions ? {
          canViewVehicles: userData.system_user_permissions.can_view_vehicles,
          canEditVehicles: userData.system_user_permissions.can_edit_vehicles,
          canViewMovements: userData.system_user_permissions.can_view_movements,
          canEditMovements: userData.system_user_permissions.can_edit_movements,
          canViewUsers: userData.system_user_permissions.can_view_users,
          canEditUsers: userData.system_user_permissions.can_edit_users,
          canViewUnits: userData.system_user_permissions.can_view_units,
          canEditUnits: userData.system_user_permissions.can_edit_units,
        } : undefined
      };
      
      return systemUser;
    } catch (error: any) {
      console.error('Exceção ao buscar dados do usuário:', error);
      toast.error('Erro ao buscar dados do usuário');
      return null;
    }
  }
}

/**
 * Instância singleton do repositório
 */
export const authRepository = new AuthRepository();
