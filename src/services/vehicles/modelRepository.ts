
import { supabase } from '@/integrations/supabase/client';
import { VehicleModel } from '@/types';
import { handleSupabaseRequest } from '@/services/api/supabase';

export interface IModelRepository {
  findAll(): Promise<VehicleModel[]>;
  findById(id: string): Promise<VehicleModel | null>;
  findByMake(makeId: string): Promise<VehicleModel[]>;
  create(name: string, makeId: string): Promise<VehicleModel | null>;
  update(id: string, data: { name?: string; makeId?: string }): Promise<boolean>;
  delete(id: string): Promise<boolean>;
  canDelete(id: string): Promise<{ canDelete: boolean; vehicleCount: number }>;
}

export class ModelRepository implements IModelRepository {
  /**
   * Busca todos os modelos
   */
  async findAll(): Promise<VehicleModel[]> {
    const data = await handleSupabaseRequest(
      async () => await supabase
        .from('vehicle_models')
        .select(`
          *,
          vehicle_makes(id, name)
        `)
        .order('name'),
      'Erro ao buscar modelos de veículos'
    );
    
    if (!data) return [];
    
    return data.map(this.mapFromDb);
  }

  /**
   * Busca modelos por marca
   */
  async findByMake(makeId: string): Promise<VehicleModel[]> {
    const data = await handleSupabaseRequest(
      async () => await supabase
        .from('vehicle_models')
        .select(`
          *,
          vehicle_makes(id, name)
        `)
        .eq('make_id', makeId)
        .order('name'),
      'Erro ao buscar modelos da marca'
    );
    
    if (!data) return [];
    
    return data.map(this.mapFromDb);
  }

  /**
   * Busca um modelo pelo ID
   */
  async findById(id: string): Promise<VehicleModel | null> {
    const data = await handleSupabaseRequest(
      async () => await supabase
        .from('vehicle_models')
        .select(`
          *,
          vehicle_makes(id, name)
        `)
        .eq('id', id)
        .single(),
      'Erro ao buscar modelo de veículo'
    );
    
    if (!data) return null;
    
    return this.mapFromDb(data);
  }

  /**
   * Cria um novo modelo
   */
  async create(name: string, makeId: string): Promise<VehicleModel | null> {
    const data = await handleSupabaseRequest(
      async () => await supabase
        .from('vehicle_models')
        .insert({
          name,
          make_id: makeId
        })
        .select()
        .single(),
      'Erro ao criar modelo de veículo'
    );
    
    if (!data) return null;
    
    return this.findById(data.id);
  }

  /**
   * Atualiza um modelo
   */
  async update(id: string, data: { name?: string; makeId?: string }): Promise<boolean> {
    const updateData: any = {
      updated_at: new Date().toISOString()
    };
    
    if (data.name !== undefined) updateData.name = data.name;
    if (data.makeId !== undefined) updateData.make_id = data.makeId;
    
    const result = await handleSupabaseRequest(
      async () => await supabase
        .from('vehicle_models')
        .update(updateData)
        .eq('id', id),
      'Erro ao atualizar modelo de veículo'
    );
    
    return result !== null;
  }

  /**
   * Verifica se um modelo pode ser excluído
   */
  async canDelete(id: string): Promise<{ canDelete: boolean; vehicleCount: number }> {
    const vehiclesCount = await handleSupabaseRequest(
      async () => await supabase
        .from('vehicles')
        .select('id', { count: 'exact', head: true })
        .eq('model_id', id),
      'Erro ao verificar veículos relacionados'
    );
    
    let count = 0;
    if (vehiclesCount && typeof vehiclesCount === 'object' && 'count' in vehiclesCount) {
      count = typeof vehiclesCount.count === 'number' ? vehiclesCount.count : 0;
    }
    
    const canDelete = count === 0;
    
    return { canDelete, vehicleCount: count };
  }

  /**
   * Remove um modelo
   */
  async delete(id: string): Promise<boolean> {
    const { canDelete } = await this.canDelete(id);
    
    if (!canDelete) {
      throw new Error('Não é possível excluir o modelo, pois existem veículos relacionados.');
    }
    
    const result = await handleSupabaseRequest(
      async () => await supabase
        .from('vehicle_models')
        .delete()
        .eq('id', id),
      'Erro ao excluir modelo de veículo'
    );
    
    return result !== null;
  }

  /**
   * Mapeia dados do banco para o formato da entidade
   */
  private mapFromDb(data: any): VehicleModel {
    return {
      id: data.id,
      name: data.name,
      makeId: data.make_id,
      makeName: data.vehicle_makes?.name,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }
}

export const modelRepository = new ModelRepository();
