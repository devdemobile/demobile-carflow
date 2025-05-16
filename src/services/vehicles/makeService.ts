
import { VehicleMake } from '@/types';
import { IMakeRepository, makeRepository } from './makeRepository';

export interface IMakeService {
  getAllMakes(): Promise<VehicleMake[]>;
  getMakeById(id: string): Promise<VehicleMake | null>;
  createMake(name: string): Promise<VehicleMake | null>;
  updateMake(id: string, name: string): Promise<boolean>;
  deleteMake(id: string): Promise<boolean>;
}

export class MakeService implements IMakeService {
  private repository: IMakeRepository;

  constructor(repository: IMakeRepository) {
    this.repository = repository;
  }

  /**
   * Obtém todas as marcas
   */
  async getAllMakes(): Promise<VehicleMake[]> {
    return this.repository.findAll();
  }

  /**
   * Obtém uma marca pelo ID
   */
  async getMakeById(id: string): Promise<VehicleMake | null> {
    return this.repository.findById(id);
  }

  /**
   * Cria uma nova marca
   */
  async createMake(name: string): Promise<VehicleMake | null> {
    // Verificar se o nome está vazio
    if (!name.trim()) {
      throw new Error('O nome da marca não pode ser vazio');
    }
    
    // Verificar se já existe uma marca com o mesmo nome
    const existingMakes = await this.repository.findAll();
    const exists = existingMakes.some(make => 
      make.name.toLowerCase() === name.toLowerCase()
    );
    
    if (exists) {
      throw new Error(`Já existe uma marca com o nome "${name}"`);
    }
    
    return this.repository.create(name);
  }

  /**
   * Atualiza uma marca
   */
  async updateMake(id: string, name: string): Promise<boolean> {
    // Verificar se o nome está vazio
    if (!name.trim()) {
      throw new Error('O nome da marca não pode ser vazio');
    }
    
    // Verificar se já existe uma marca com o mesmo nome (excluindo a atual)
    const existingMakes = await this.repository.findAll();
    const exists = existingMakes.some(make => 
      make.name.toLowerCase() === name.toLowerCase() && make.id !== id
    );
    
    if (exists) {
      throw new Error(`Já existe uma marca com o nome "${name}"`);
    }
    
    return this.repository.update(id, name);
  }

  /**
   * Remove uma marca
   */
  async deleteMake(id: string): Promise<boolean> {
    return this.repository.delete(id);
  }
}

export const makeService = new MakeService(makeRepository);
