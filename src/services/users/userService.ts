
/**
 * Serviço de negócios para Usuários
 */
import { SystemUser, SystemUserDTO, UserPermissions, UserStatus } from '@/types';
import { IUserRepository, userRepository } from './userRepository';

/**
 * Interface do serviço de usuários
 */
export interface IUserService {
  getAllUsers(): Promise<SystemUser[]>;
  getUserById(id: string): Promise<SystemUser | null>;
  getUserByUsername(username: string): Promise<SystemUser | null>;
  getUsersByUnit(unitId: string): Promise<SystemUser[]>;
  authenticateUser(username: string, password: string): Promise<SystemUser | null>;
  createUser(userData: SystemUserDTO): Promise<SystemUser | null>;
  updateUser(id: string, userData: Partial<SystemUserDTO>): Promise<boolean>;
  changePassword(id: string, newPassword: string): Promise<boolean>;
  activateUser(id: string): Promise<boolean>;
  deactivateUser(id: string): Promise<boolean>;
  deleteUser(id: string): Promise<boolean>;
  getUserPermissions(userId: string): Promise<UserPermissions | null>;
  updateUserPermissions(userId: string, permissions: Partial<UserPermissions>): Promise<boolean>;
}

/**
 * Implementação do serviço de usuários
 */
export class UserService implements IUserService {
  private repository: IUserRepository;

  constructor(userRepository: IUserRepository) {
    this.repository = userRepository;
  }

  /**
   * Obtém todos os usuários
   */
  async getAllUsers(): Promise<SystemUser[]> {
    return this.repository.findAll();
  }

  /**
   * Obtém um usuário pelo ID
   */
  async getUserById(id: string): Promise<SystemUser | null> {
    return this.repository.findById(id);
  }

  /**
   * Obtém um usuário pelo nome de usuário
   */
  async getUserByUsername(username: string): Promise<SystemUser | null> {
    return this.repository.findByUsername(username);
  }

  /**
   * Obtém usuários por unidade
   */
  async getUsersByUnit(unitId: string): Promise<SystemUser[]> {
    return this.repository.findByUnit(unitId);
  }

  /**
   * Autentica um usuário
   */
  async authenticateUser(username: string, password: string): Promise<SystemUser | null> {
    // Validar credenciais
    const userId = await this.repository.validateCredentials(username, password);
    
    if (!userId) return null;
    
    // Buscar dados do usuário
    return this.repository.findById(userId);
  }

  /**
   * Cria um novo usuário
   */
  async createUser(userData: SystemUserDTO): Promise<SystemUser | null> {
    // Verificar se já existe usuário com o mesmo username
    const existingUser = await this.repository.findByUsername(userData.username);
    if (existingUser) {
      throw new Error(`Nome de usuário '${userData.username}' já está em uso`);
    }
    
    return this.repository.create(userData);
  }

  /**
   * Atualiza um usuário existente
   */
  async updateUser(id: string, userData: Partial<SystemUserDTO>): Promise<boolean> {
    // Verificar se o usuário existe
    const user = await this.repository.findById(id);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }
    
    // Se estiver alterando o username, verificar se já não está em uso
    if (userData.username && userData.username !== user.username) {
      const existingUser = await this.repository.findByUsername(userData.username);
      if (existingUser) {
        throw new Error(`Nome de usuário '${userData.username}' já está em uso`);
      }
    }
    
    return this.repository.update(id, userData);
  }

  /**
   * Altera a senha de um usuário
   */
  async changePassword(id: string, newPassword: string): Promise<boolean> {
    // Verificar se o usuário existe
    const user = await this.repository.findById(id);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }
    
    // Validar complexidade da senha
    if (newPassword.length < 6) {
      throw new Error('A senha deve ter pelo menos 6 caracteres');
    }
    
    return this.repository.updatePassword(id, newPassword);
  }

  /**
   * Ativa um usuário
   */
  async activateUser(id: string): Promise<boolean> {
    // Verificar se o usuário existe
    const user = await this.repository.findById(id);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }
    
    return this.repository.updateStatus(id, 'active');
  }

  /**
   * Desativa um usuário
   */
  async deactivateUser(id: string): Promise<boolean> {
    // Verificar se o usuário existe
    const user = await this.repository.findById(id);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }
    
    return this.repository.updateStatus(id, 'inactive');
  }

  /**
   * Remove um usuário
   */
  async deleteUser(id: string): Promise<boolean> {
    // Verificar se o usuário existe
    const user = await this.repository.findById(id);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }
    
    return this.repository.delete(id);
  }

  /**
   * Obtém as permissões de um usuário
   */
  async getUserPermissions(userId: string): Promise<UserPermissions | null> {
    return this.repository.getPermissions(userId);
  }

  /**
   * Atualiza as permissões de um usuário
   */
  async updateUserPermissions(userId: string, permissions: Partial<UserPermissions>): Promise<boolean> {
    // Verificar se o usuário existe
    const user = await this.repository.findById(userId);
    if (!user) {
      throw new Error('Usuário não encontrado');
    }
    
    return this.repository.updatePermissions(userId, permissions);
  }
}

/**
 * Instância singleton do serviço
 */
export const userService = new UserService(userRepository);
