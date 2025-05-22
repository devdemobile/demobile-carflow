
import { LoginCredentials, SystemUser } from '@/types';

/**
 * Interface for the authentication service
 */
export interface IAuthService {
  login(credentials: LoginCredentials): Promise<SystemUser | null>;
  validateUserStatus(user: SystemUser): boolean;
  verifyPassword(username: string, password: string): Promise<boolean>;
}
