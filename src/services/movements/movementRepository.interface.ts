
import { Movement, MovementDTO, VehicleLocation } from '@/types';

/**
 * Interface para o repositório de movimentações
 */
export interface IMovementRepository {
  findAll(): Promise<Movement[]>;
  findById(id: string): Promise<Movement | null>;
  findByVehicle(vehicleId: string): Promise<Movement[]>;
  findByStatus(status: VehicleLocation): Promise<Movement[]>;
  findByDriver(driverName: string): Promise<Movement[]>;
  search(term: string): Promise<Movement[]>;
  create(movementData: MovementDTO, userId: string): Promise<Movement | null>;
  updateWithReturn(id: string, data: Partial<Movement>): Promise<Movement | null>;
  delete(id: string): Promise<boolean>;
}

// Export the interface directly
export { IMovementRepository };
