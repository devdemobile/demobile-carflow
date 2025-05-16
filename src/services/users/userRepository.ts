
/**
 * Repositório de acesso a dados de Usuários
 */
import { supabase } from '@/integrations/supabase/client';
import { SystemUser, SystemUserDTO, UserPermissions, UserRole, UserShift, UserStatus } from '@/types';
import { handleSupabaseRequest } from '@/services/api/supabase';

/**
 * Interface do repositório de usuários
 */
export interface IUserRepository {
  findAll(): Promise<SystemUser[]>;
  findById(id: string): Promise<SystemUser | null>;
  findByUsername(username: string): Promise<SystemUser | null>;
  findByUnit(unitId: string): Promise<SystemUser[]>;
  validateCredentials(username: string, password: string): Promise<string | null>;
  create(userData: SystemUserDTO): Promise<SystemUser | null>;
  update(id: string, userData: Partial<SystemUserDTO>): Promise<boolean>;
  updatePassword(id: string, newPassword: string): Promise<boolean>;
  updateStatus(id: string, status: UserStatus): Promise<boolean>;
  delete(id: string): Promise<boolean>;
  getPermissions(userId: string): Promise<UserPermissions | null>;
  updatePermissions(userId: string, permissions: Partial<UserPermissions>): Promise<boolean>;
}

/**
 * Implementação do repositório de usuários usando Supabase
 */
export class UserRepository implements IUserRepository {
  /**
   * Busca todos os usuários
   */
  async findAll(): Promise<SystemUser[]> {
    const data = await handleSupabaseRequest(
      async () => await supabase
        .from('system_users')
        .select('*, units(name), system_user_permissions(*)')
        .order('name'),
      'Erro ao buscar usuários'
    ) || [];
    
    return data.map(this.mapUserFromDB);
  }

  /**
   * Busca um usuário pelo ID
   */
  async findById(id: string): Promise<SystemUser | null> {
    const data = await handleSupabaseRequest(
      async () => await supabase
        .from('system_users')
        .select('*, units(name), system_user_permissions(*)')
        .eq('id', id)
        .single(),
      'Erro ao buscar usuário'
    );
    
    if (data) {
      return this.mapUserFromDB(data);
    }
    
    return null;
  }

  /**
   * Busca um usuário pelo nome de usuário
   */
  async findByUsername(username: string): Promise<SystemUser | null> {
    const data = await handleSupabaseRequest(
      async () => await supabase
        .from('system_users')
        .select('*, units(name), system_user_permissions(*)')
        .eq('username', username)
        .single(),
      'Erro ao buscar usuário pelo nome de usuário'
    );
    
    if (data) {
      return this.mapUserFromDB(data);
    }
    
    return null;
  }

  /**
   * Busca usuários por unidade
   */
  async findByUnit(unitId: string): Promise<SystemUser[]> {
    const data = await handleSupabaseRequest(
      async () => await supabase
        .from('system_users')
        .select('*, units(name), system_user_permissions(*)')
        .eq('unit_id', unitId)
        .order('name'),
      'Erro ao buscar usuários da unidade'
    ) || [];
    
    return data.map(this.mapUserFromDB);
  }

  /**
   * Valida credenciais de usuário
   */
  async validateCredentials(username: string, password: string): Promise<string | null> {
    const data = await handleSupabaseRequest(
      async () => await supabase.rpc('verify_password', {
        username,
        password_attempt: password
      }),
      'Erro ao validar credenciais'
    );
    
    return data || null;
  }

  /**
   * Cria um novo usuário
   */
  async create(userData: SystemUserDTO): Promise<SystemUser | null> {
    // Primeiro cria o usuário
    const user = await handleSupabaseRequest(
      async () => await supabase
        .from('system_users')
        .insert([{
          name: userData.name,
          username: userData.username,
          email: userData.email || null,
          password_hash: await this.hashPassword(userData.password),
          role: userData.role || 'operator',
          shift: userData.shift || 'day',
          status: 'active',
          unit_id: userData.unitId
        }])
        .select()
        .single(),
      'Erro ao criar usuário'
    );
    
    if (!user) return null;
    
    // Depois cria as permissões
    if (userData.permissions) {
      await handleSupabaseRequest(
        async () => await supabase
          .from('system_user_permissions')
          .insert([{
            user_id: user.id,
            can_view_vehicles: userData.permissions.canViewVehicles || false,
            can_edit_vehicles: userData.permissions.canEditVehicles || false,
            can_view_units: userData.permissions.canViewUnits || false,
            can_edit_units: userData.permissions.canEditUnits || false,
            can_view_users: userData.permissions.canViewUsers || false,
            can_edit_users: userData.permissions.canEditUsers || false,
            can_view_movements: userData.permissions.canViewMovements || true,
            can_edit_movements: userData.permissions.canEditMovements || false
          }]),
        'Erro ao criar permissões do usuário'
      );
    } else {
      // Cria permissões padrão
      await handleSupabaseRequest(
        async () => await supabase
          .from('system_user_permissions')
          .insert([{
            user_id: user.id,
            can_view_vehicles: true,
            can_edit_vehicles: false,
            can_view_units: false,
            can_edit_units: false,
            can_view_users: false,
            can_edit_users: false,
            can_view_movements: true,
            can_edit_movements: false
          }]),
        'Erro ao criar permissões padrão do usuário'
      );
    }
    
    return this.findById(user.id);
  }

  /**
   * Atualiza um usuário existente
   */
  async update(id: string, userData: Partial<SystemUserDTO>): Promise<boolean> {
    const updateData: Record<string, any> = {
      updated_at: new Date()
    };
    
    if (userData.name) updateData.name = userData.name;
    if (userData.email !== undefined) updateData.email = userData.email;
    if (userData.role) updateData.role = userData.role;
    if (userData.shift) updateData.shift = userData.shift;
    if (userData.unitId) updateData.unit_id = userData.unitId;
    
    const result = await handleSupabaseRequest(
      async () => await supabase
        .from('system_users')
        .update(updateData)
        .eq('id', id),
      'Erro ao atualizar usuário'
    );
    
    // Se tiver permissões para atualizar, atualiza
    if (userData.permissions) {
      await this.updatePermissions(id, userData.permissions);
    }
    
    return result !== null;
  }

  /**
   * Atualiza a senha de um usuário
   */
  async updatePassword(id: string, newPassword: string): Promise<boolean> {
    const result = await handleSupabaseRequest(
      async () => await supabase
        .from('system_users')
        .update({
          password_hash: await this.hashPassword(newPassword),
          updated_at: new Date()
        })
        .eq('id', id),
      'Erro ao atualizar senha'
    );
    
    return result !== null;
  }

  /**
   * Atualiza o status de um usuário
   */
  async updateStatus(id: string, status: UserStatus): Promise<boolean> {
    const result = await handleSupabaseRequest(
      async () => await supabase
        .from('system_users')
        .update({
          status,
          updated_at: new Date()
        })
        .eq('id', id),
      'Erro ao atualizar status do usuário'
    );
    
    return result !== null;
  }

  /**
   * Remove um usuário
   */
  async delete(id: string): Promise<boolean> {
    const result = await handleSupabaseRequest(
      async () => await supabase
        .from('system_users')
        .delete()
        .eq('id', id),
      'Erro ao excluir usuário'
    );
    
    return result !== null;
  }

  /**
   * Obtém as permissões de um usuário
   */
  async getPermissions(userId: string): Promise<UserPermissions | null> {
    const data = await handleSupabaseRequest(
      async () => await supabase
        .from('system_user_permissions')
        .select('*')
        .eq('user_id', userId)
        .single(),
      'Erro ao buscar permissões do usuário'
    );
    
    if (!data) return null;
    
    return {
      canViewVehicles: data.can_view_vehicles,
      canEditVehicles: data.can_edit_vehicles,
      canViewUnits: data.can_view_units,
      canEditUnits: data.can_edit_units,
      canViewUsers: data.can_view_users,
      canEditUsers: data.can_edit_users,
      canViewMovements: data.can_view_movements,
      canEditMovements: data.can_edit_movements
    };
  }

  /**
   * Atualiza as permissões de um usuário
   */
  async updatePermissions(userId: string, permissions: Partial<UserPermissions>): Promise<boolean> {
    const updateData: Record<string, any> = {
      updated_at: new Date()
    };
    
    if (permissions.canViewVehicles !== undefined) updateData.can_view_vehicles = permissions.canViewVehicles;
    if (permissions.canEditVehicles !== undefined) updateData.can_edit_vehicles = permissions.canEditVehicles;
    if (permissions.canViewUnits !== undefined) updateData.can_view_units = permissions.canViewUnits;
    if (permissions.canEditUnits !== undefined) updateData.can_edit_units = permissions.canEditUnits;
    if (permissions.canViewUsers !== undefined) updateData.can_view_users = permissions.canViewUsers;
    if (permissions.canEditUsers !== undefined) updateData.can_edit_users = permissions.canEditUsers;
    if (permissions.canViewMovements !== undefined) updateData.can_view_movements = permissions.canViewMovements;
    if (permissions.canEditMovements !== undefined) updateData.can_edit_movements = permissions.canEditMovements;
    
    const result = await handleSupabaseRequest(
      async () => await supabase
        .from('system_user_permissions')
        .update(updateData)
        .eq('user_id', userId),
      'Erro ao atualizar permissões do usuário'
    );
    
    return result !== null;
  }

  /**
   * Hash de senha utilizando a função do banco de dados
   */
  private async hashPassword(password: string): Promise<string> {
    const hash = await handleSupabaseRequest(
      async () => await supabase.rpc('hash_password', { password }),
      'Erro ao gerar hash da senha'
    );
    
    if (!hash) throw new Error('Erro ao gerar hash da senha');
    return hash;
  }

  /**
   * Mapeia dados do usuário do formato DB para o formato da aplicação
   */
  private mapUserFromDB(data: any): SystemUser {
    const permissions: UserPermissions = data.system_user_permissions?.[0] 
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
export const userRepository = new UserRepository();
