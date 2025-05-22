
import { UserPermissions, UserRole, UserShift, UserStatus } from './entities';

/**
 * Data Transfer Object for user operations
 */
export interface UserDTO {
  name: string;
  username?: string;
  password?: string;
  email?: string;
  role?: UserRole;
  shift?: UserShift;
  status?: UserStatus;
  unitId?: string;
  permissions?: Partial<UserPermissions>;
}

/**
 * Response data for user permissions
 */
export interface UserPermissionsResponse {
  can_view_vehicles: boolean;
  can_edit_vehicles: boolean;
  can_view_units: boolean;
  can_edit_units: boolean;
  can_view_users: boolean;
  can_edit_users: boolean;
  can_view_movements: boolean;
  can_edit_movements: boolean;
  user_id: string;
}
