
/**
 * Serviço de negócios para Veículos
 */
import { Vehicle, VehicleDTO, VehicleLocation } from '@/types';
import { IVehicleRepository, vehicleRepository } from './vehicleRepository';

/**
 * Interface do serviço de veículos
 */
export interface IVehicleService {
  getAllVehicles(): Promise<Vehicle[]>;
  getVehicleById(id: string): Promise<Vehicle | null>;
  getVehicleByPlate(plate: string): Promise<Vehicle | null>;
  searchVehicles(searchTerm: string): Promise<Vehicle[]>;
  getVehiclesByUnit(unitId: string): Promise<Vehicle[]>;
  getVehiclesByLocation(location: VehicleLocation): Promise<Vehicle[]>;
  createVehicle(vehicleData: VehicleDTO): Promise<Vehicle | null>;
  updateVehicle(id: string, vehicleData: Partial<VehicleDTO>): Promise<boolean>;
  deleteVehicle(id: string): Promise<boolean>;
}

/**
 * Implementação do serviço de veículos
 */
export class VehicleService implements IVehicleService {
  private repository: IVehicleRepository;

  constructor(vehicleRepository: IVehicleRepository) {
    this.repository = vehicleRepository;
  }

  /**
   * Obtém todos os veículos
   */
  async getAllVehicles(): Promise<Vehicle[]> {
    return this.repository.findAll();
  }

  /**
   * Obtém um veículo pelo ID
   */
  async getVehicleById(id: string): Promise<Vehicle | null> {
    return this.repository.findById(id);
  }

  /**
   * Obtém um veículo pela placa
   */
  async getVehicleByPlate(plate: string): Promise<Vehicle | null> {
    return this.repository.findByPlate(plate);
  }

  /**
   * Pesquisa veículos por termo
   */
  async searchVehicles(searchTerm: string): Promise<Vehicle[]> {
    return this.repository.search(searchTerm);
  }

  /**
   * Obtém veículos por unidade
   */
  async getVehiclesByUnit(unitId: string): Promise<Vehicle[]> {
    return this.repository.findByUnit(unitId);
  }

  /**
   * Obtém veículos por localização
   */
  async getVehiclesByLocation(location: VehicleLocation): Promise<Vehicle[]> {
    return this.repository.findByLocation(location);
  }

  /**
   * Cria um novo veículo
   */
  async createVehicle(vehicleData: VehicleDTO): Promise<Vehicle | null> {
    // Verifica se já existe um veículo com a mesma placa
    const existingVehicle = await this.repository.findByPlate(vehicleData.plate);
    if (existingVehicle) {
      throw new Error(`Já existe um veículo com a placa ${vehicleData.plate}`);
    }

    return this.repository.create(vehicleData);
  }

  /**
   * Atualiza um veículo existente
   */
  async updateVehicle(id: string, vehicleData: Partial<VehicleDTO>): Promise<boolean> {
    // Se a placa estiver sendo alterada, verifica se não existe outro veículo com a mesma placa
    if (vehicleData.plate) {
      const existingVehicle = await this.repository.findByPlate(vehicleData.plate);
      if (existingVehicle && existingVehicle.id !== id) {
        throw new Error(`Já existe um veículo com a placa ${vehicleData.plate}`);
      }
    }

    return this.repository.update(id, vehicleData);
  }

  /**
   * Remove um veículo
   */
  async deleteVehicle(id: string): Promise<boolean> {
    return this.repository.delete(id);
  }
}

/**
 * Instância singleton do serviço
 */
export const vehicleService = new VehicleService(vehicleRepository);
