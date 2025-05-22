
/**
 * Serviço para gerenciamento de usuários
 */
import { SystemUser, UserPermissions, UserStatus } from '@/types/entities';
import { userRepository, IUserRepository } from '@/services/users/userRepository';
import { toast } from 'sonner';

/**
 * Interface para o serviço de usuários
 */
export interface IUserService {
  changeUserPassword(userId: string, password: string): Promise<boolean>;
  updateUserPermissions(userId: string, permissions: UserPermissions): Promise<boolean>;
}

/**
 * Implementação do serviço de usuários
 */
export class UserService implements IUserService {
  private repository: IUserRepository;
  
  constructor(repo: IUserRepository) {
    this.repository = repo;
  }
  
  /**
   * Altera a senha de um usuário
   */
  async changeUserPassword(userId: string, password: string): Promise<boolean> {
    if (!password || password.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres');
      return false;
    }
    
    const result = await this.repository.updateUserPassword(userId, password);
    
    if (result) {
      toast.success('Senha alterada com sucesso');
    }
    
    return result;
  }
  
  /**
   * Atualiza as permissões de um usuário
   */
  async updateUserPermissions(userId: string, permissions: UserPermissions): Promise<boolean> {
    const result = await this.repository.updateUserPermissions(userId, permissions);
    return result;
  }
}

/**
 * Instância singleton do serviço
 */
export const userService = new UserService(userRepository);
