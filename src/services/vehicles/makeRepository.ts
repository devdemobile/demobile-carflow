
import { supabase } from '@/integrations/supabase/client';
import { VehicleMake } from '@/types';
import { handleSupabaseRequest } from '@/services/api/supabase';

export interface IMakeRepository {
  findAll(): Promise<VehicleMake[]>;
  findById(id: string): Promise<VehicleMake | null>;
  create(name: string): Promise<VehicleMake | null>;
  update(id: string, name: string): Promise<boolean>;
  delete(id: string): Promise<boolean>;
  canDelete(id: string): Promise<{ canDelete: boolean; vehicleCount: number }>;
}

export class MakeRepository implements IMakeRepository {
  /**
   * Busca todas as marcas
   */
  async findAll(): Promise<VehicleMake[]> {
    const data = await handleSupabaseRequest(
      async () => await supabase
        .from('vehicle_makes')
        .select('*')
        .order('name'),
      'Erro ao buscar marcas de veículos'
    );
    
    if (!data) return [];
    
    return data.map(this.mapFromDb);
  }

  /**
   * Busca uma marca pelo ID
   */
  async findById(id: string): Promise<VehicleMake | null> {
    const data = await handleSupabaseRequest(
      async () => await supabase
        .from('vehicle_makes')
        .select('*')
        .eq('id', id)
        .single(),
      'Erro ao buscar marca de veículo'
    );
    
    if (!data) return null;
    
    return this.mapFromDb(data);
  }

  /**
   * Cria uma nova marca
   */
  async create(name: string): Promise<VehicleMake | null> {
    const data = await handleSupabaseRequest(
      async () => await supabase
        .from('vehicle_makes')
        .insert({ name })
        .select()
        .single(),
      'Erro ao criar marca de veículo'
    );
    
    if (!data) return null;
    
    return this.mapFromDb(data);
  }

  /**
   * Atualiza uma marca
   */
  async update(id: string, name: string): Promise<boolean> {
    const result = await handleSupabaseRequest(
      async () => await supabase
        .from('vehicle_makes')
        .update({ 
          name,
          updated_at: new Date().toISOString() 
        })
        .eq('id', id),
      'Erro ao atualizar marca de veículo'
    );
    
    return result !== null;
  }

  /**
   * Verifica se uma marca pode ser excluída
   */
  async canDelete(id: string): Promise<{ canDelete: boolean; vehicleCount: number }> {
    const vehiclesCount = await handleSupabaseRequest(
      async () => await supabase
        .from('vehicles')
        .select('id', { count: 'exact', head: true })
        .eq('make_id', id),
      'Erro ao verificar veículos relacionados'
    );
    
    let count = 0;
    if (vehiclesCount && typeof vehiclesCount === 'object' && 'count' in vehiclesCount) {
      count = typeof vehiclesCount.count === 'number' ? vehiclesCount.count : 0;
    }
    
    // Verificar também se existem modelos associados a esta marca
    const modelsCount = await handleSupabaseRequest(
      async () => await supabase
        .from('vehicle_models')
        .select('id', { count: 'exact', head: true })
        .eq('make_id', id),
      'Erro ao verificar modelos relacionados'
    );
    
    let modelsTotal = 0;
    if (modelsCount && typeof modelsCount === 'object' && 'count' in modelsCount) {
      modelsTotal = typeof modelsCount.count === 'number' ? modelsCount.count : 0;
    }
    
    const canDelete = count === 0 && modelsTotal === 0;
    
    return { canDelete, vehicleCount: count };
  }

  /**
   * Remove uma marca
   */
  async delete(id: string): Promise<boolean> {
    const { canDelete } = await this.canDelete(id);
    
    if (!canDelete) {
      throw new Error('Não é possível excluir a marca, pois existem veículos ou modelos relacionados.');
    }
    
    const result = await handleSupabaseRequest(
      async () => await supabase
        .from('vehicle_makes')
        .delete()
        .eq('id', id),
      'Erro ao excluir marca de veículo'
    );
    
    return result !== null;
  }

  /**
   * Mapeia dados do banco para o formato da entidade
   */
  private mapFromDb(data: any): VehicleMake {
    return {
      id: data.id,
      name: data.name,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  }
}

export const makeRepository = new MakeRepository();
