
/**
 * Serviço de negócios para Movimentações
 */
import { Movement, MovementDTO, VehicleLocation } from '@/types';
import { movementRepository } from './movementRepository';
import { IMovementRepository } from './movementRepository.interface';
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
  createExitMovement(movementData: MovementDTO): Promise<Movement | null>;
  registerEntryMovement(vehicleId: string, data: { 
    finalMileage: number, 
    arrivalDate: string, 
    arrivalTime: string, 
    arrivalUnitId: string 
  }): Promise<Movement | null>;
  updateMovement(id: string, data: Partial<Movement>): Promise<Movement | null>;
  deleteMovement(id: string): Promise<boolean>;
  getActiveMovementByVehicle(vehicleId: string): Promise<Movement | null>;
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
   * Obtém a movimentação ativa (status 'out') de um veículo
   */
  async getActiveMovementByVehicle(vehicleId: string): Promise<Movement | null> {
    const movements = await this.repository.findByVehicle(vehicleId);
    return movements.find(m => m.status === 'out') || null;
  }

  /**
   * Cria uma nova movimentação de SAÍDA
   */
  async createExitMovement(movementData: MovementDTO): Promise<Movement | null> {
    const vehicleId = movementData.vehicleId;
    
    // Verificar se o veículo existe
    const vehicle = await vehicleService.getVehicleById(vehicleId);
    if (!vehicle) {
      throw new Error('Veículo não encontrado');
    }

    // Verificar se o veículo já está em movimento
    const activeMovement = await this.getActiveMovementByVehicle(vehicleId);
    if (activeMovement) {
      throw new Error('Veículo já possui uma movimentação ativa. Registre primeiro a entrada.');
    }

    // Verificar se a quilometragem inicial é válida
    if (movementData.initialMileage < vehicle.mileage) {
      throw new Error(`Quilometragem inicial (${movementData.initialMileage}) não pode ser menor que a quilometragem atual do veículo (${vehicle.mileage})`);
    }

    // Criar movimentação de saída
    const exitMovementData: MovementDTO = {
      ...movementData,
      type: 'exit'
    };

    const userId = ''; // Default empty string
    const movement = await this.repository.create(exitMovementData, userId);

    if (movement) {
      // Atualizar localização do veículo para 'out'
      await vehicleService.updateVehicleLocation(vehicleId, 'out', movementData.initialMileage);
    }

    return movement;
  }

  /**
   * Registra a ENTRADA do veículo (atualiza a movimentação existente)
   */
  async registerEntryMovement(vehicleId: string, data: { 
    finalMileage: number, 
    arrivalDate: string, 
    arrivalTime: string, 
    arrivalUnitId: string 
  }): Promise<Movement | null> {
    // Buscar movimentação ativa do veículo
    const activeMovement = await this.getActiveMovementByVehicle(vehicleId);
    if (!activeMovement) {
      throw new Error('Não há movimentação ativa para este veículo');
    }

    // Verificar se a quilometragem final é válida
    if (data.finalMileage <= activeMovement.initialMileage) {
      throw new Error(`Quilometragem final (${data.finalMileage}) deve ser maior que a quilometragem inicial (${activeMovement.initialMileage})`);
    }

    // Calcular quilometragem percorrida
    const mileageRun = data.finalMileage - activeMovement.initialMileage;

    // Calcular duração da movimentação
    const departureDateTime = new Date(`${activeMovement.departureDate}T${activeMovement.departureTime}`);
    const arrivalDateTime = new Date(`${data.arrivalDate}T${data.arrivalTime}`);
    const durationMs = arrivalDateTime.getTime() - departureDateTime.getTime();
    
    // Formatar duração (hh:mm)
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    const duration = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;

    // Atualizar a movimentação existente com os dados de entrada
    const updatedMovement = await this.repository.updateWithReturn(activeMovement.id, {
      finalMileage: data.finalMileage,
      mileageRun,
      arrivalDate: data.arrivalDate,
      arrivalTime: data.arrivalTime,
      arrivalUnitId: data.arrivalUnitId,
      duration,
      status: 'yard' // Mudar status para 'yard'
    });

    if (updatedMovement) {
      // Atualizar localização do veículo para 'yard'
      await vehicleService.updateVehicleLocation(vehicleId, 'yard', data.finalMileage);
    }

    return updatedMovement;
  }

  /**
   * Atualiza uma movimentação existente
   */
  async updateMovement(id: string, data: Partial<Movement>): Promise<Movement | null> {
    // Buscar movimentação atual
    const movement = await this.repository.findById(id);
    if (!movement) {
      throw new Error('Movimentação não encontrada');
    }
    
    // Update only allowed fields
    const updateData: Partial<Movement> = {};
    
    if (data.driver !== undefined) updateData.driver = data.driver;
    if (data.destination !== undefined) updateData.destination = data.destination;
    if (data.initialMileage !== undefined) updateData.initialMileage = data.initialMileage;
    if (data.notes !== undefined) updateData.notes = data.notes;
    
    return this.repository.updateWithReturn(id, updateData);
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
