
import { VehicleModel } from '@/types';
import { IModelRepository, modelRepository } from './modelRepository';

export interface IModelService {
  getAllModels(): Promise<VehicleModel[]>;
  getModelsByMake(makeId: string): Promise<VehicleModel[]>;
  getModelById(id: string): Promise<VehicleModel | null>;
  createModel(name: string, makeId: string): Promise<VehicleModel | null>;
  updateModel(id: string, data: { name?: string; makeId?: string }): Promise<boolean>;
  deleteModel(id: string): Promise<boolean>;
}

export class ModelService implements IModelService {
  private repository: IModelRepository;

  constructor(repository: IModelRepository) {
    this.repository = repository;
  }

  /**
   * Obtém todos os modelos
   */
  async getAllModels(): Promise<VehicleModel[]> {
    return this.repository.findAll();
  }

  /**
   * Obtém modelos de uma marca específica
   */
  async getModelsByMake(makeId: string): Promise<VehicleModel[]> {
    return this.repository.findByMake(makeId);
  }

  /**
   * Obtém um modelo pelo ID
   */
  async getModelById(id: string): Promise<VehicleModel | null> {
    return this.repository.findById(id);
  }

  /**
   * Cria um novo modelo
   */
  async createModel(name: string, makeId: string): Promise<VehicleModel | null> {
    // Verificar se o nome está vazio
    if (!name.trim()) {
      throw new Error('O nome do modelo não pode ser vazio');
    }
    
    // Verificar se a marca foi informada
    if (!makeId) {
      throw new Error('A marca deve ser informada');
    }
    
    return this.repository.create(name, makeId);
  }

  /**
   * Atualiza um modelo
   */
  async updateModel(id: string, data: { name?: string; makeId?: string }): Promise<boolean> {
    // Verificar se o nome está vazio
    if (data.name !== undefined && !data.name.trim()) {
      throw new Error('O nome do modelo não pode ser vazio');
    }
    
    return this.repository.update(id, data);
  }

  /**
   * Remove um modelo
   */
  async deleteModel(id: string): Promise<boolean> {
    return this.repository.delete(id);
  }
}

export const modelService = new ModelService(modelRepository);
