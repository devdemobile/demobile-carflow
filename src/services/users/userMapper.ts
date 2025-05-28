
import { SystemUser, UserPermissions } from '@/types/entities';
import { UserPermissionsResponse } from '@/types/user.types';

/**
 * Maps user data from database format to application format
 */
export class UserMapper {
  /**
   * Maps basic user data from database format to application format
   */
  static mapUserFromDb(data: any): SystemUser {
    return {
      id: data.id,
      name: data.name,
      username: data.username,
      email: data.email,
      role: data.role,
      shift: data.shift,
      status: data.status,
      unitId: data.unit_id,
      unitName: data.units?.name
    };
  }

  /**
   * Maps user data with permissions from database format to application format
   */
  static mapUserWithPermissionsFromDb(data: any): SystemUser {
    const user = this.mapUserFromDb(data);
    
    const permissions = data.system_user_permissions?.[0];
    
    if (permissions) {
      user.permissions = this.mapPermissionsFromDb(permissions);
    }
    
    return user;
  }

  /**
   * Maps permissions data from database format to application format
   */
  static mapPermissionsFromDb(data: UserPermissionsResponse): UserPermissions {
    return {
      canViewVehicles: data.can_view_vehicles,
      canEditVehicles: data.can_edit_vehicles,
      canViewUnits: data.can_view_units,
      canEditUnits: data.can_edit_units,
      canViewUsers: data.can_view_users,
      canEditUsers: data.can_edit_users,
      canViewMovements: data.can_view_movements,
      canEditMovements: data.can_edit_movements,
      canSwitchUnits: data.can_switch_units
    };
  }
}
