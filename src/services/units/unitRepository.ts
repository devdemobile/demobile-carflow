
import { supabase } from '@/integrations/supabase/client';
import { Unit, UnitDTO } from '@/types';
import { handleSupabaseRequest, callRPC } from '@/services/api/supabase';

export interface IUnitRepository {
  findAll(): Promise<Unit[]>;
  findById(id: string): Promise<Unit | null>;
  create(unitData: UnitDTO): Promise<Unit | null>;
  update(id: string, unitData: UnitDTO): Promise<boolean>;
  delete(id: string): Promise<boolean>;
  canDeleteUnit(id: string): Promise<{canDelete: boolean, vehicleCount?: number, usersCount?: number}>;
  fetchVehicleCountByUnit(): Promise<Record<string, number>>;
  fetchUserCountByUnit(): Promise<Record<string, number>>;
}

export class UnitRepository implements IUnitRepository {
  /**
   * Busca todas as unidades
   */
  async findAll(): Promise<Unit[]> {
    const data = await handleSupabaseRequest(
      async () => await supabase
        .from('units')
        .select('*')
        .order('name'),
      'Erro ao buscar unidades'
    );
    
    if (!data) return [];
    
    return data.map(this.mapUnitFromDb);
  }

  /**
   * Busca uma unidade pelo ID
   */
  async findById(id: string): Promise<Unit | null> {
    const data = await handleSupabaseRequest(
      async () => await supabase
        .from('units')
        .select('*')
        .eq('id', id)
        .maybeSingle(),
      'Erro ao buscar unidade'
    );
    
    if (!data) return null;
    
    return this.mapUnitFromDb(data);
  }

  /**
   * Cria uma nova unidade
   */
  async create(unitData: UnitDTO): Promise<Unit | null> {
    const data = await handleSupabaseRequest(
      async () => await supabase
        .from('units')
        .insert({
          name: unitData.name,
          code: unitData.code,
          address: unitData.address
        })
        .select()
        .single(),
      'Erro ao criar unidade'
    );
    
    if (!data) return null;
    
    return this.mapUnitFromDb(data);
  }

  /**
   * Atualiza uma unidade
   */
  async update(id: string, unitData: UnitDTO): Promise<boolean> {
    const result = await handleSupabaseRequest(
      async () => await supabase
        .from('units')
        .update({
          name: unitData.name,
          code: unitData.code,
          address: unitData.address,
          updated_at: new Date().toISOString()
        })
        .eq('id', id),
      'Erro ao atualizar unidade'
    );
    
    return result !== null;
  }

  /**
   * Remove uma unidade
   */
  async delete(id: string): Promise<boolean> {
    const result = await handleSupabaseRequest(
      async () => await supabase
        .from('units')
        .delete()
        .eq('id', id),
      'Erro ao excluir unidade'
    );
    
    return result !== null;
  }

  /**
   * Verifica se uma unidade pode ser excluída
   */
  async canDeleteUnit(id: string): Promise<{canDelete: boolean, vehicleCount?: number, usersCount?: number}> {
    // Verificar veículos
    const { count: vehicleCount, error: vehicleError } = await supabase
      .from('vehicles')
      .select('*', { count: 'exact', head: true })
      .eq('unit_id', id);
    
    if (vehicleError) {
      console.error('Erro ao verificar veículos da unidade:', vehicleError);
      return { canDelete: false };
    }

    // Verificar usuários
    const { count: usersCount, error: usersError } = await supabase
      .from('system_users')
      .select('*', { count: 'exact', head: true })
      .eq('unit_id', id);
    
    if (usersError) {
      console.error('Erro ao verificar usuários da unidade:', usersError);
      return { canDelete: false };
    }

    const canDelete = (vehicleCount || 0) === 0 && (usersCount || 0) === 0;
    
    return {
      canDelete,
      vehicleCount: vehicleCount || 0,
      usersCount: usersCount || 0
    };
  }

  /**
   * Busca contagem de veículos por unidade usando a função do banco
   */
  async fetchVehicleCountByUnit(): Promise<Record<string, number>> {
    try {
      const { data, error } = await supabase.rpc('count_vehicles_by_unit');
      
      if (error) {
        console.error('Erro ao buscar contagens de veículos:', error);
        return {};
      }
      
      if (!data) return {};
      
      const counts: Record<string, number> = {};
      data.forEach((row: any) => {
        counts[row.unit_id] = parseInt(row.vehicle_count) || 0;
      });
      
      return counts;
    } catch (error) {
      console.error('Exceção ao buscar contagens de veículos:', error);
      return {};
    }
  }

  /**
   * Busca contagem de usuários por unidade usando a função do banco
   */
  async fetchUserCountByUnit(): Promise<Record<string, number>> {
    try {
      const { data, error } = await supabase.rpc('count_users_by_unit');
      
      if (error) {
        console.error('Erro ao buscar contagens de usuários:', error);
        return {};
      }
      
      if (!data) return {};
      
      const counts: Record<string, number> = {};
      data.forEach((row: any) => {
        counts[row.unit_id] = parseInt(row.user_count) || 0;
      });
      
      return counts;
    } catch (error) {
      console.error('Exceção ao buscar contagens de usuários:', error);
      return {};
    }
  }

  /**
   * Mapeia dados da unidade do formato DB para o formato da aplicação
   */
  private mapUnitFromDb(data: any): Unit {
    return {
      id: data.id,
      name: data.name,
      code: data.code,
      address: data.address,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      createdBy: data.created_by
    };
  }
}

export const unitRepository = new UnitRepository();
