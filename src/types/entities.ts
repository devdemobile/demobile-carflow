/**
 * Tipos de entidades principais do sistema
 */

export type VehicleLocation = 'yard' | 'out';
export type MovementType = 'entry' | 'exit' | 'initial';
export type UserRole = 'admin' | 'operator';
export type UserShift = 'day' | 'night';
export type UserStatus = 'active' | 'inactive';
export type LogActionType = 'edit' | 'delete';

export interface Unit {
  id: string;
  name: string;
  code: string;
  address: string;
  vehicleCount?: number;
  usersCount?: number;
  movementsCount?: number;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
}

export interface SystemUser {
  id: string;
  name: string;
  username: string;
  email?: string;
  role: UserRole;
  shift: UserShift;
  status: UserStatus;
  unitId?: string;  // Make unitId optional to match database structure
  unit_id?: string; // Support legacy field from database
  unitName?: string;
  units?: { name: string }; // Support nested units object from Supabase join
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
  makeId?: string;
  modelId?: string;
  destination?: string; // Added destination property to Vehicle interface
}

export interface VehicleMake {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface VehicleModel {
  id: string;
  name: string;
  makeId: string;
  makeName?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Movement {
  id: string;
  vehicleId: string;
  vehiclePlate?: string; // Placa do veículo
  plate?: string; // Mantido para compatibilidade com código existente
  vehicleName?: string; // Nome completo do veículo (make + model + color)
  driver: string;
  destination?: string;
  initialMileage: number;
  finalMileage?: number;
  mileageRun?: number;
  departureUnitId: string;
  departureUnitName?: string; // Nome da unidade de saída
  departureDate: string;
  departureTime: string;
  arrivalUnitId?: string;
  arrivalUnitName?: string; // Nome da unidade de chegada
  arrivalDate?: string;
  arrivalTime?: string;
  duration?: string;
  status: VehicleLocation;
  type: MovementType;
  createdBy?: string;
  notes?: string;
  photoUrl?: string; // URL da foto do veículo associado
}

export interface MovementLog {
  id: string;
  movementId: string;
  userId: string;
  userName?: string;
  actionType: LogActionType;
  actionDetails: string;
  createdAt: string;
}
