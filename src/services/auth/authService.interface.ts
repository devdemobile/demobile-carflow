
import { LoginCredentials, SystemUser } from "@/types";

/**
 * Interface para o serviço de autenticação
 */
export interface IAuthService {
  /**
   * Realiza login com credenciais
   */
  login(credentials: LoginCredentials): Promise<SystemUser | null>;

  /**
   * Valida se o usuário está ativo
   */
  validateUserStatus(user: SystemUser): boolean;

  /**
   * Verifica a senha de um usuário
   */
  verifyPassword(username: string, password: string): Promise<boolean>;
}
