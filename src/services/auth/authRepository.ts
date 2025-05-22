
/**
 * Repositório para autenticação
 */
import { supabase } from '@/integrations/supabase/client';
import { LoginCredentials, SystemUser } from '@/types';
import { handleSupabaseRequest } from '@/services/api/supabase';

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
   * Realiza login com credenciais
   */
  async login(credentials: LoginCredentials): Promise<string | null> {
    console.log(`Tentando login com usuário: ${credentials.username}`);
    
    const result = await handleSupabaseRequest(
      async () => await supabase.rpc('verify_password', {
        username_input: credentials.username,
        password_attempt: credentials.password
      }),
      'Erro ao realizar login'
    );
    
    console.log('Resultado do login:', result);
    return result;
  }

  /**
   * Busca dados do usuário pelo ID
   */
  async getUserData(userId: string): Promise<SystemUser | null> {
    const data = await handleSupabaseRequest(
      async () => await supabase
        .from('system_users')
        .select('*, units(name), system_user_permissions(*)')
        .eq('id', userId)
        .single(),
      'Erro ao buscar dados do usuário'
    );
    
    if (!data) return null;
    
    // Mapear permissões
    const permissions = data.system_user_permissions?.[0] 
      ? {
        canViewVehicles: data.system_user_permissions[0].can_view_vehicles,
        canEditVehicles: data.system_user_permissions[0].can_edit_vehicles,
        canViewUnits: data.system_user_permissions[0].can_view_units,
        canEditUnits: data.system_user_permissions[0].can_edit_units,
        canViewUsers: data.system_user_permissions[0].can_view_users,
        canEditUsers: data.system_user_permissions[0].can_edit_users,
        canViewMovements: data.system_user_permissions[0].can_view_movements,
        canEditMovements: data.system_user_permissions[0].can_edit_movements
      }
      : {
        canViewVehicles: false,
        canEditVehicles: false,
        canViewUnits: false,
        canEditUnits: false,
        canViewUsers: false,
        canEditUsers: false,
        canViewMovements: true,
        canEditMovements: false
      };
      
    return {
      id: data.id,
      name: data.name,
      username: data.username,
      email: data.email,
      role: data.role,
      shift: data.shift,
      status: data.status,
      unitId: data.unit_id,
      unitName: data.units?.name,
      permissions
    };
  }
}

/**
 * Instância singleton do repositório
 */
export const authRepository = new AuthRepository();
