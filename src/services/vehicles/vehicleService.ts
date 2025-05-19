
/**
 * Serviço de negócios para Veículos
 */
import { Vehicle, VehicleDTO, VehicleLocation } from '@/types';
import { IVehicleRepository, vehicleRepository } from './vehicleRepository';
import { movementService } from '../movements/movementService';

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
    // Buscar todos os veículos
    const vehicles = await this.repository.findAll();
    
    // Atualizar destinos para veículos em rota
    return this.updateDestinationsForVehiclesInRoute(vehicles);
  }

  /**
   * Obtém um veículo pelo ID
   */
  async getVehicleById(id: string): Promise<Vehicle | null> {
    const vehicle = await this.repository.findById(id);
    if (!vehicle) return null;
    
    // Se o veículo estiver em rota, atualizar o destino
    if (vehicle.location === 'out') {
      const updatedVehicles = await this.updateDestinationsForVehiclesInRoute([vehicle]);
      return updatedVehicles[0];
    }
    
    return vehicle;
  }

  /**
   * Obtém um veículo pela placa
   */
  async getVehicleByPlate(plate: string): Promise<Vehicle | null> {
    const vehicle = await this.repository.findByPlate(plate);
    if (!vehicle) return null;
    
    // Se o veículo estiver em rota, atualizar o destino
    if (vehicle.location === 'out') {
      const updatedVehicles = await this.updateDestinationsForVehiclesInRoute([vehicle]);
      return updatedVehicles[0];
    }
    
    return vehicle;
  }

  /**
   * Pesquisa veículos por termo
   */
  async searchVehicles(searchTerm: string): Promise<Vehicle[]> {
    const vehicles = await this.repository.search(searchTerm);
    
    // Atualizar destinos para veículos em rota
    return this.updateDestinationsForVehiclesInRoute(vehicles);
  }

  /**
   * Obtém veículos por unidade
   */
  async getVehiclesByUnit(unitId: string): Promise<Vehicle[]> {
    const vehicles = await this.repository.findByUnit(unitId);
    
    // Atualizar destinos para veículos em rota
    return this.updateDestinationsForVehiclesInRoute(vehicles);
  }

  /**
   * Obtém veículos por localização
   */
  async getVehiclesByLocation(location: VehicleLocation): Promise<Vehicle[]> {
    const vehicles = await this.repository.findByLocation(location);
    
    // Atualizar destinos para veículos em rota
    return this.updateDestinationsForVehiclesInRoute(vehicles);
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

  /**
   * Método auxiliar para atualizar os destinos de veículos que estão em rota
   * @private
   */
  private async updateDestinationsForVehiclesInRoute(vehicles: Vehicle[]): Promise<Vehicle[]> {
    // Filtrar apenas veículos em rota
    const vehiclesInRoute = vehicles.filter(v => v.location === 'out');
    
    if (vehiclesInRoute.length === 0) {
      return vehicles; // Se não houver veículos em rota, retorna a lista original
    }
    
    // Para cada veículo em rota, buscar sua movimentação ativa
    const promises = vehiclesInRoute.map(async (vehicle) => {
      try {
        // Buscar movimentações do veículo
        const movements = await movementService.getMovementsByVehicle(vehicle.id);
        
        // Encontrar a movimentação de saída mais recente (status 'out')
        const activeMovement = movements
          .filter(m => m.status === 'out' && m.type === 'exit')
          .sort((a, b) => {
            const dateA = new Date(`${a.departureDate}T${a.departureTime}`);
            const dateB = new Date(`${b.departureDate}T${b.departureTime}`);
            return dateB.getTime() - dateA.getTime();
          })[0];
        
        // Se encontrar uma movimentação ativa, atualizar o destino do veículo
        if (activeMovement && activeMovement.destination) {
          vehicle.destination = activeMovement.destination;
        }
      } catch (error) {
        console.error(`Erro ao buscar destino do veículo ${vehicle.plate}:`, error);
      }
      
      return vehicle;
    });
    
    // Processar as promessas e atualizar os veículos em rota
    const updatedVehiclesInRoute = await Promise.all(promises);
    
    // Substituir os veículos em rota na lista original
    const updatedVehicleMap = new Map<string, Vehicle>();
    updatedVehiclesInRoute.forEach(v => updatedVehicleMap.set(v.id, v));
    
    return vehicles.map(v => updatedVehicleMap.get(v.id) || v);
  }
}

/**
 * Instância singleton do serviço
 */
export const vehicleService = new VehicleService(vehicleRepository);
