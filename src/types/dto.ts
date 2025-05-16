
/**
 * Data Transfer Objects para operações com APIs
 */
import { Movement, Unit, Vehicle, SystemUser, UserPermissions, UserRole, UserShift, UserStatus } from './entities';

export interface UnitDTO {
  name: string;
  code: string;
  address?: string;
}

export interface VehicleDTO {
  plate: string;
  make: string;
  model: string;
  color: string;
  year: number;
  mileage: number;
  photoUrl?: string;
  location?: 'yard' | 'out';
  unitId: string;
  makeId?: string;
  modelId?: string;
}

export interface MovementDTO {
  vehicleId: string;
  driver: string;
  destination?: string;
  initialMileage: number;
  finalMileage?: number;
  departureUnitId: string;
  departureDate?: string;
  departureTime?: string;
  arrivalUnitId?: string;
  arrivalDate?: string;
  arrivalTime?: string;
  type: 'entry' | 'exit' | 'initial';
}

export interface UserDTO {
  name: string;
  username: string;
  email?: string;
  password: string;
  role?: UserRole;
  shift?: UserShift;
  status?: UserStatus;
  unitId: string;
  permissions?: UserPermissions;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  success: boolean;
}
