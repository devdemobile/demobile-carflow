
import { SystemUser, UserPermissions, UserStatus } from '@/types/entities';
import { UserDTO } from '@/types/user.types';

/**
 * Interface for user repository operations
 */
export interface IUserRepository {
  getUserById(id: string): Promise<SystemUser | null>;
  updateUserPassword(userId: string, newPassword: string): Promise<boolean>;
  updateUserPermissions(userId: string, permissions: any): Promise<boolean>;
}
