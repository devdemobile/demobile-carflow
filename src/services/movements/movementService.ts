
/**
 * Serviço de negócios para Movimentações
 */
import { Movement, MovementDTO, VehicleLocation } from '@/types';
import { IMovementRepository, movementRepository } from './movementRepository';
import { vehicleService } from '../vehicles/vehicleService';

/**
 * Interface do serviço de movimentações
 */
export interface IMovementService {
  getAllMovements(): Promise<Movement[]>;
  getMovementById(id: string): Promise<Movement | null>;
  getMovementsByVehicle(vehicleId: string): Promise<Movement[]>;
  getMovementsByStatus(status: VehicleLocation): Promise<Movement[]>;
  searchMovements(searchTerm: string): Promise<Movement[]>;
  createMovement(movementData: MovementDTO, userId: string): Promise<Movement | null>;
  finalizeMovement(id: string, data: { 
    finalMileage: number, 
    arrivalDate: string, 
    arrivalTime: string, 
    arrivalUnitId: string 
  }): Promise<Movement | null>;
  deleteMovement(id: string): Promise<boolean>;
}

/**
 * Implementação do serviço de movimentações
 */
export class MovementService implements IMovementService {
  private repository: IMovementRepository;

  constructor(movementRepository: IMovementRepository) {
    this.repository = movementRepository;
  }

  /**
   * Obtém todas as movimentações
   */
  async getAllMovements(): Promise<Movement[]> {
    return this.repository.findAll();
  }

  /**
   * Obtém uma movimentação pelo ID
   */
  async getMovementById(id: string): Promise<Movement | null> {
    return this.repository.findById(id);
  }

  /**
   * Obtém movimentações por veículo
   */
  async getMovementsByVehicle(vehicleId: string): Promise<Movement[]> {
    return this.repository.findByVehicle(vehicleId);
  }

  /**
   * Obtém movimentações por status
   */
  async getMovementsByStatus(status: VehicleLocation): Promise<Movement[]> {
    return this.repository.findByStatus(status);
  }

  /**
   * Pesquisa movimentações por termo
   */
  async searchMovements(searchTerm: string): Promise<Movement[]> {
    return this.repository.search(searchTerm);
  }

  /**
   * Cria uma nova movimentação
   */
  async createMovement(movementData: MovementDTO, userId: string): Promise<Movement | null> {
    // Verificar se o veículo existe
    const vehicle = await vehicleService.getVehicleById(movementData.vehicleId);
    if (!vehicle) {
      throw new Error('Veículo não encontrado');
    }

    // Verificar se o tipo da movimentação é compatível com a localização atual do veículo
    if (movementData.type === 'exit' && vehicle.location === 'out') {
      throw new Error('Veículo já está em movimento');
    }

    if (movementData.type === 'entry' && vehicle.location === 'yard') {
      throw new Error('Veículo já está no pátio');
    }

    // Verificar se a quilometragem inicial é válida
    if (movementData.type === 'exit' && movementData.initialMileage < vehicle.mileage) {
      throw new Error(`Quilometragem inicial (${movementData.initialMileage}) não pode ser menor que a quilometragem atual do veículo (${vehicle.mileage})`);
    }

    return this.repository.create(movementData, userId);
  }

  /**
   * Finaliza uma movimentação (retorno de veículo)
   */
  async finalizeMovement(id: string, data: { 
    finalMileage: number, 
    arrivalDate: string, 
    arrivalTime: string, 
    arrivalUnitId: string 
  }): Promise<Movement | null> {
    // Buscar movimentação atual
    const movement = await this.repository.findById(id);
    if (!movement) {
      throw new Error('Movimentação não encontrada');
    }

    // Verificar se movimentação já está finalizada
    if (movement.status === 'yard') {
      throw new Error('Esta movimentação já está finalizada');
    }

    // Verificar se a quilometragem final é válida
    if (data.finalMileage <= movement.initialMileage) {
      throw new Error(`Quilometragem final (${data.finalMileage}) deve ser maior que a quilometragem inicial (${movement.initialMileage})`);
    }

    // Calcular quilometragem percorrida
    const mileageRun = data.finalMileage - movement.initialMileage;

    // Calcular duração da movimentação
    const departureDateTime = new Date(`${movement.departureDate}T${movement.departureTime}`);
    const arrivalDateTime = new Date(`${data.arrivalDate}T${data.arrivalTime}`);
    const durationMs = arrivalDateTime.getTime() - departureDateTime.getTime();
    
    // Formatar duração (hh:mm)
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    const duration = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

    // Atualizar movimentação
    return this.repository.updateWithReturn(id, {
      finalMileage: data.finalMileage,
      mileageRun,
      arrivalDate: data.arrivalDate,
      arrivalTime: data.arrivalTime,
      arrivalUnitId: data.arrivalUnitId,
      duration,
      status: 'yard',
      type: 'entry'
    });
  }

  /**
   * Remove uma movimentação
   */
  async deleteMovement(id: string): Promise<boolean> {
    // Verificar se a movimentação existe
    const movement = await this.repository.findById(id);
    if (!movement) {
      throw new Error('Movimentação não encontrada');
    }

    return this.repository.delete(id);
  }
}

/**
 * Instância singleton do serviço
 */
export const movementService = new MovementService(movementRepository);
