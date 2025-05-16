
/**
 * Tipos de entidades principais do sistema
 */

export type VehicleLocation = 'yard' | 'out';
export type MovementType = 'entry' | 'exit' | 'initial';
export type UserRole = 'admin' | 'operator';
export type UserShift = 'day' | 'night';
export type UserStatus = 'active' | 'inactive';

export interface Unit {
  id: string;
  name: string;
  code: string;
  address: string;
  vehicleCount?: number;
  usersCount?: number;
}

export interface SystemUser {
  id: string;
  name: string;
  username: string;
  email?: string;
  role: UserRole;
  shift: UserShift;
  status: UserStatus;
  unitId: string;
  unitName?: string;
  permissions?: UserPermissions;
}

export interface UserPermissions {
  canViewVehicles: boolean;
  canEditVehicles: boolean;
  canViewUnits: boolean;
  canEditUnits: boolean;
  canViewUsers: boolean;
  canEditUsers: boolean;
  canViewMovements: boolean;
  canEditMovements: boolean;
}

export interface Vehicle {
  id: string;
  plate: string;
  make: string;
  model: string;
  color: string;
  year: number;
  mileage: number;
  photoUrl?: string;
  location: VehicleLocation;
  unitId: string;
  unitName?: string;
}

export interface Movement {
  id: string;
  vehicleId: string;
  plate?: string;
  vehicleName?: string;
  driver: string;
  destination?: string;
  initialMileage: number;
  finalMileage?: number;
  mileageRun?: number;
  departureUnitId: string;
  departureDate: string;
  departureTime: string;
  arrivalUnitId?: string;
  arrivalDate?: string;
  arrivalTime?: string;
  duration?: string;
  status: VehicleLocation;
  type: MovementType;
  createdBy?: string;
}
