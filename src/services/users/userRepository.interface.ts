
import { SystemUser, UserPermissions, UserStatus } from '@/types/entities';
import { UserDTO } from '@/types/user.types';

/**
 * Interface for user repository operations
 */
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
