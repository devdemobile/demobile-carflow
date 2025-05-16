
/**
 * Serviço para autenticação de usuários
 */
import { LoginCredentials, SystemUser } from '@/types';
import { IAuthRepository, authRepository } from './authRepository';
import { toast } from 'sonner';

/**
 * Interface para o serviço de autenticação
 */
export interface IAuthService {
  login(credentials: LoginCredentials): Promise<SystemUser | null>;
  validateUserStatus(user: SystemUser): boolean;
}

/**
 * Implementação do serviço de autenticação
 */
export class AuthService implements IAuthService {
  private repository: IAuthRepository;

  constructor(authRepo: IAuthRepository) {
    this.repository = authRepo;
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
}

/**
 * Instância singleton do serviço
 */
export const authService = new AuthService(authRepository);
