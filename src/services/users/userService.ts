
import { toast } from 'sonner';
import { SystemUser, UserPermissions, UserRole, UserStatus } from '@/types';
import { UserDTO, LoginCredentials } from '@/types/dto';
import { userRepository, IUserRepository } from './userRepository';

/**
 * Interface para o serviço de usuários
 */
export interface IUserService {
  getAllUsers(): Promise<SystemUser[]>;
  getUserById(id: string): Promise<SystemUser | null>;
  getUsersByUnit(unitId: string): Promise<SystemUser[]>;
  validateCredentials(credentials: LoginCredentials): Promise<SystemUser | null>;
  createUser(userData: UserDTO, createdBy: string): Promise<SystemUser | null>;
  updateUser(id: string, userData: Partial<UserDTO>): Promise<boolean>;
  changePassword(userId: string, newPassword: string): Promise<boolean>;
  updateUserStatus(userId: string, status: UserStatus): Promise<boolean>;
  updateUserPermissions(userId: string, permissions: Partial<UserPermissions>): Promise<boolean>;
  deleteUser(id: string): Promise<boolean>;
  getUserPermissions(userId: string): Promise<UserPermissions | null>;
}

/**
 * Implementação do serviço de usuários
 */
export class UserService implements IUserService {
  private repository: IUserRepository;
  
  constructor(repository: IUserRepository) {
    this.repository = repository;
  }
  
  /**
   * Busca todos os usuários
   */
  async getAllUsers(): Promise<SystemUser[]> {
    try {
      return await this.repository.findAll();
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      toast.error('Erro ao carregar dados dos usuários');
      return [];
    }
  }
  
  /**
   * Busca um usuário pelo ID
   */
  async getUserById(id: string): Promise<SystemUser | null> {
    try {
      return await this.repository.findById(id);
    } catch (error) {
      console.error(`Erro ao buscar usuário ${id}:`, error);
      toast.error('Erro ao carregar dados do usuário');
      return null;
    }
  }
  
  /**
   * Busca usuários por unidade
   */
  async getUsersByUnit(unitId: string): Promise<SystemUser[]> {
    try {
      return await this.repository.findByUnitId(unitId);
    } catch (error) {
      console.error(`Erro ao buscar usuários da unidade ${unitId}:`, error);
      toast.error('Erro ao carregar usuários da unidade');
      return [];
    }
  }
  
  /**
   * Valida credenciais de usuário
   */
  async validateCredentials(credentials: LoginCredentials): Promise<SystemUser | null> {
    try {
      const userId = await this.repository.verifyPassword(credentials.username, credentials.password);
      
      if (!userId) {
        toast.error('Credenciais inválidas');
        return null;
      }
      
      return this.repository.findById(userId);
    } catch (error) {
      console.error('Erro ao validar credenciais:', error);
      toast.error('Erro ao fazer login');
      return null;
    }
  }
  
  /**
   * Cria um novo usuário
   */
  async createUser(userData: UserDTO, createdBy: string): Promise<SystemUser | null> {
    try {
      const user = await this.repository.create(userData, createdBy);
      
      if (user) {
        toast.success('Usuário criado com sucesso');
      }
      
      return user;
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      toast.error('Erro ao criar usuário');
      return null;
    }
  }
  
  /**
   * Atualiza um usuário existente
   */
  async updateUser(id: string, userData: Partial<UserDTO>): Promise<boolean> {
    try {
      const success = await this.repository.update(id, userData);
      
      if (success) {
        toast.success('Usuário atualizado com sucesso');
      }
      
      return success;
    } catch (error) {
      console.error(`Erro ao atualizar usuário ${id}:`, error);
      toast.error('Erro ao atualizar usuário');
      return false;
    }
  }
  
  /**
   * Altera a senha de um usuário
   */
  async changePassword(userId: string, newPassword: string): Promise<boolean> {
    try {
      const success = await this.repository.updateUserPassword(userId, newPassword);
      
      if (success) {
        toast.success('Senha alterada com sucesso');
      }
      
      return success;
    } catch (error) {
      console.error(`Erro ao alterar senha do usuário ${userId}:`, error);
      toast.error('Erro ao alterar senha');
      return false;
    }
  }
  
  /**
   * Atualiza o status de um usuário
   */
  async updateUserStatus(userId: string, status: UserStatus): Promise<boolean> {
    try {
      const success = await this.repository.updateStatus(userId, status);
      
      if (success) {
        toast.success(`Usuário ${status === 'active' ? 'ativado' : 'desativado'} com sucesso`);
      }
      
      return success;
    } catch (error) {
      console.error(`Erro ao atualizar status do usuário ${userId}:`, error);
      toast.error('Erro ao atualizar status do usuário');
      return false;
    }
  }
  
  /**
   * Atualiza as permissões de um usuário
   */
  async updateUserPermissions(userId: string, permissions: Partial<UserPermissions>): Promise<boolean> {
    try {
      const success = await this.repository.updatePermissions(userId, permissions);
      
      if (success) {
        toast.success('Permissões atualizadas com sucesso');
      }
      
      return success;
    } catch (error) {
      console.error(`Erro ao atualizar permissões do usuário ${userId}:`, error);
      toast.error('Erro ao atualizar permissões');
      return false;
    }
  }
  
  /**
   * Remove um usuário
   */
  async deleteUser(id: string): Promise<boolean> {
    try {
      const success = await this.repository.delete(id);
      
      if (success) {
        toast.success('Usuário excluído com sucesso');
      }
      
      return success;
    } catch (error) {
      console.error(`Erro ao excluir usuário ${id}:`, error);
      toast.error('Erro ao excluir usuário');
      return false;
    }
  }
  
  /**
   * Obtém as permissões de um usuário
   */
  async getUserPermissions(userId: string): Promise<UserPermissions | null> {
    try {
      return await this.repository.getUserPermissions(userId);
    } catch (error) {
      console.error(`Erro ao buscar permissões do usuário ${userId}:`, error);
      toast.error('Erro ao carregar permissões do usuário');
      return null;
    }
  }
}

/**
 * Instância singleton do serviço
 */
export const userService = new UserService(userRepository);
