
export type VehicleLocation = 'yard' | 'out';

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
}

export interface Movement {
  id: string;
  vehicleId: string;
  plate: string;
  vehicleName: string;
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
  type: 'entry' | 'exit' | 'initial';
}

export interface Unit {
  id: string;
  name: string;
  code: string;
  address: string;
  vehicleCount: number;
  usersCount: number;
}

export interface VehicleMovementFormData {
  plate: string;
  driver: string;
  initialMileage: number;
  finalMileage?: number;
  destination?: string;
}
