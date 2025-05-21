import { supabase } from '@/integrations/supabase/client';
import { SystemUser, UserPermissions, UserRole, UserShift, UserStatus } from '@/types/entities';
import { UserDTO } from '@/types/dto';
import { handleSupabaseRequest } from '@/services/api/supabase';

export interface IUserRepository {
  findAll(): Promise<SystemUser[]>;
  findById(id: string): Promise<SystemUser | null>;
  findByUsername(username: string): Promise<SystemUser | null>;
  findByUnitId(unitId: string): Promise<SystemUser[]>;
  create(userData: UserDTO, createdBy: string): Promise<SystemUser | null>;
  update(id: string, userData: Partial<UserDTO>): Promise<boolean>;
  updatePermissions(userId: string, permissions: Partial<UserPermissions>): Promise<boolean>;
  updateStatus(userId: string, status: UserStatus): Promise<boolean>;
  updateUserPassword(userId: string, newPassword: string): Promise<boolean>;
  delete(id: string): Promise<boolean>;
  verifyPassword(username: string, password: string): Promise<string | null>;
  getUserPermissions(userId: string): Promise<UserPermissions | null>;
}

export class UserRepository implements IUserRepository {
  /**
   * Busca todos os usuários
   */
  async findAll(): Promise<SystemUser[]> {
    const data = await handleSupabaseRequest(
      async () => await supabase
        .from('system_users')
        .select(`
          *,
          units(id, name)
        `)
        .order('name'),
      'Erro ao buscar usuários'
    );

    if (!data) return [];

    return data.map(this.mapUserFromDb);
  }

  /**
   * Busca um usuário pelo ID
   */
  async findById(id: string): Promise<SystemUser | null> {
    const data = await handleSupabaseRequest(
      async () => await supabase
        .from('system_users')
        .select(`
          *,
          units(id, name),
          system_user_permissions!system_user_permissions_user_id_fkey(*)
        `)
        .eq('id', id)
        .single(),
      'Erro ao buscar usuário'
    );

    if (!data) return null;

    return this.mapUserWithPermissionsFromDb(data);
  }

  /**
   * Busca um usuário pelo username
   */
  async findByUsername(username: string): Promise<SystemUser | null> {
    const data = await handleSupabaseRequest(
      async () => await supabase
        .from('system_users')
        .select(`
          *,
          units(id, name),
          system_user_permissions!system_user_permissions_user_id_fkey(*)
        `)
        .eq('username', username)
        .single(),
      'Erro ao buscar usuário por username'
    );

    if (!data) return null;

    return this.mapUserWithPermissionsFromDb(data);
  }

  /**
   * Busca usuários por unidade
   */
  async findByUnitId(unitId: string): Promise<SystemUser[]> {
    const data = await handleSupabaseRequest(
      async () => await supabase
        .from('system_users')
        .select(`
          *,
          units(id, name)
        `)
        .eq('unit_id', unitId)
        .order('name'),
      'Erro ao buscar usuários da unidade'
    );

    if (!data) return [];

    return data.map(this.mapUserFromDb);
  }

  /**
   * Criar um novo usuário
   */
  async create(userData: UserDTO, createdBy: string): Promise<SystemUser | null> {
    // Obtém o hash da senha usando a função correta do banco de dados
    const hashResult = await handleSupabaseRequest(
      async () => await supabase.rpc('verify_password2', {
        username: userData.username,
        password_attempt: userData.password
      }),
      'Erro ao criar hash da senha'
    );

    if (!hashResult) return null;

    try {
      // Criar o usuário com o hash da senha
      const { data, error } = await supabase
        .from('system_users')
        .insert({
          name: userData.name,
          username: userData.username,
          email: userData.email,
          password_hash: String(hashResult), // Converter para string para garantir compatibilidade
          role: userData.role,
          shift: userData.shift,
          status: userData.status || 'active',
          unit_id: userData.unitId,
          created_by: createdBy,
        })
        .select('*')
        .single();

      if (!data) return null;

      // Criar permissões para o usuário
      const permissionsInsert = await handleSupabaseRequest(
        async () => await supabase
          .from('system_user_permissions')
          .insert({
            user_id: data.id,
            can_view_vehicles: userData.permissions?.canViewVehicles || false,
            can_edit_vehicles: userData.permissions?.canEditVehicles || false,
            can_view_units: userData.permissions?.canViewUnits || false,
            can_edit_units: userData.permissions?.canEditUnits || false,
            can_view_users: userData.permissions?.canViewUsers || false,
            can_edit_users: userData.permissions?.canEditUsers || false,
            can_view_movements: userData.permissions?.canViewMovements || true,
            can_edit_movements: userData.permissions?.canEditMovements || false
          }),
        'Erro ao criar permissões do usuário'
      );

      if (!permissionsInsert) {
        // Se falhou ao criar permissões, remover o usuário criado
        await supabase.from('system_users').delete().eq('id', data.id);
        return null;
      }

      return this.findById(data.id);
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      return null;
    }
  }

  /**
   * Atualizar um usuário existente
   */
  async update(userId: string, userData: Partial<UserDTO>): Promise<boolean> {
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString()
    };

    if (userData.name) updateData.name = userData.name;
    if (userData.email !== undefined) updateData.email = userData.email;
    if (userData.role) updateData.role = userData.role;
    if (userData.shift) updateData.shift = userData.shift;
    if (userData.status) updateData.status = userData.status;
    if (userData.unitId) updateData.unit_id = userData.unitId;

    // Se houver senha, atualizar o hash
    if (userData.password) {
      // Precisamos do username para a função verify_password2
      const user = await this.findById(userId);
      if (!user) return false;
      
      const hashResult = await handleSupabaseRequest(
        async () => await supabase.rpc('verify_password2', {
          username: user.username,
          password_attempt: userData.password
        }),
        'Erro ao criar hash da senha'
      );

      if (!hashResult) return false;

      updateData.password_hash = String(hashResult);
    }

    const result = await handleSupabaseRequest(
      async () => await supabase
        .from('system_users')
        .update(updateData)
        .eq('id', userId),
      'Erro ao atualizar usuário'
    );

    // Atualizar permissões se fornecidas
    if (userData.permissions) {
      const success = await this.updatePermissions(userId, userData.permissions);
      if (!success) return false;
    }

    return result !== null;
  }

  /**
   * Atualiza a senha de um usuário
   */
  async updateUserPassword(userId: string, newPassword: string): Promise<boolean> {
    // Precisamos obter o username primeiro
    const user = await this.findById(userId);
    if (!user) return false;

    // Usar a função correta para gerar o hash da senha
    const hashResult = await handleSupabaseRequest(
      async () => await supabase.rpc('verify_password2', {
        username: user.username,
        password_attempt: newPassword
      }),
      'Erro ao criar hash da senha'
    );

    if (!hashResult) return false;

    // Atualizar o hash da senha no banco de dados
    const result = await handleSupabaseRequest(
      async () => await supabase
        .from('system_users')
        .update({
          password_hash: String(hashResult),
          updated_at: new Date().toISOString()
        })
        .eq('id', userId),
      'Erro ao atualizar senha'
    );

    return !!result;
  }

  /**
   * Atualiza permissões de um usuário
   */
  async updatePermissions(userId: string, permissions: Partial<UserPermissions>): Promise<boolean> {
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString()
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
   * Atualiza o status de um usuário
   */
  async updateStatus(userId: string, status: UserStatus): Promise<boolean> {
    const result = await handleSupabaseRequest(
      async () => await supabase
        .from('system_users')
        .update({
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId),
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
   * Verifica a senha de um usuário
   */
  async verifyPassword(username: string, password: string): Promise<string | null> {
    const result = await handleSupabaseRequest(
      async () => await supabase.rpc('verify_password', {
        username_input: username,
        password_attempt: password
      }),
      'Erro ao verificar credenciais'
    );

    return result;
  }

  /**
   * Obtém as permissões de um usuário
   */
  async getUserPermissions(userId: string): Promise<UserPermissions | null> {
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
   * Mapeia dados do usuário do formato do DB para o formato da aplicação
   */
  private mapUserFromDb(data: any): SystemUser {
    return {
      id: data.id,
      name: data.name,
      username: data.username,
      email: data.email,
      role: data.role,
      shift: data.shift,
      status: data.status,
      unitId: data.unit_id,
      unitName: data.units?.name
    };
  }

  /**
   * Mapeia dados do usuário com permissões do formato do DB para o formato da aplicação
   */
  private mapUserWithPermissionsFromDb(data: any): SystemUser {
    const user = this.mapUserFromDb(data);
    
    const permissions = data.system_user_permissions?.[0];
    
    if (permissions) {
      user.permissions = {
        canViewVehicles: permissions.can_view_vehicles,
        canEditVehicles: permissions.can_edit_vehicles,
        canViewUnits: permissions.can_view_units,
        canEditUnits: permissions.can_edit_units,
        canViewUsers: permissions.can_view_users,
        canEditUsers: permissions.can_edit_users,
        canViewMovements: permissions.can_view_movements,
        canEditMovements: permissions.can_edit_movements
      };
    }
    
    return user;
  }
}

export const userRepository = new UserRepository();
