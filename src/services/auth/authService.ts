/**
 * Serviço para autenticação de usuários
 */
import { LoginCredentials, SystemUser } from '@/types';
import { AuthRepository } from './authRepository';
import { toast } from 'sonner';

/**
 * Interface para o serviço de autenticação
 */
export interface IAuthService {
  login(credentials: LoginCredentials): Promise<SystemUser | null>;
  validateUserStatus(user: SystemUser): boolean;
  verifyPassword(username: string, password: string): Promise<boolean>;
  switchUnit(userId: string, unitId: string): Promise<SystemUser | null>;
}

/**
 * Implementação do serviço de autenticação
 */
export class AuthService implements IAuthService {
  private repository: AuthRepository;

  constructor() {
    this.repository = new AuthRepository();
  }

  /**
   * Realiza login com credenciais
   */
  async login(credentials: LoginCredentials): Promise<SystemUser | null> {
    try {
      // Validar credenciais
      const userId = await this.repository.login(credentials);
      
      if (!userId) {
        toast.error('Nome de usuário ou senha inválidos');
        return null;
      }
      
      // Buscar dados do usuário
      const userData = await this.repository.getUserData(userId);
      
      if (!userData) {
        toast.error('Erro ao buscar dados do usuário');
        return null;
      }
      
      // Verificar status do usuário
      if (!this.validateUserStatus(userData)) {
        toast.error('Usuário está inativo');
        return null;
      }
      
      toast.success(`Bem-vindo, ${userData.name}`);
      return userData;
    } catch (error: any) {
      toast.error(`Erro ao fazer login: ${error.message}`);
      return null;
    }
  }

  /**
   * Valida se o usuário está ativo
   */
  validateUserStatus(user: SystemUser): boolean {
    return user.status === 'active';
  }

  /**
   * Verifica a senha de um usuário
   * @param username Nome de usuário
   * @param password Senha a verificar
   * @returns true se a senha for válida, false caso contrário
   */
  async verifyPassword(username: string, password: string): Promise<boolean> {
    try {
      const userId = await this.repository.login({ username, password });
      return !!userId; // Retorna true se userId não for nulo/undefined
    } catch (error) {
      return false;
    }
  }

  async switchUnit(userId: string, unitId: string): Promise<SystemUser | null> {
    try {
      // Buscar dados do usuário
      const userData = await this.repository.getUserData(userId);
      if (!userData) {
        return null;
      }

      // Atualizar unidade
      const updatedUser = {
        ...userData,
        unitId: unitId
      };

      return updatedUser;
    } catch (error) {
      console.error('Erro ao trocar unidade:', error);
      return null;
    }
  }
}

/**
 * Instância singleton do serviço
 */
export const authService = new AuthService();
