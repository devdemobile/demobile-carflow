/**
 * Repositório de acesso a dados de Unidades
 */
import { supabase } from '@/integrations/supabase/client';
import { Unit, UnitDTO } from '@/types';
import { handleSupabaseRequest, callRPC } from '@/services/api/supabase';

/**
 * Interface do repositório de unidades
 */
export interface IUnitRepository {
  findAll(): Promise<Unit[]>;
  findById(id: string): Promise<Unit | null>;
  findByCode(code: string): Promise<Unit | null>;
  create(unitData: UnitDTO): Promise<Unit | null>;
  update(id: string, unitData: UnitDTO): Promise<boolean>;
  delete(id: string): Promise<boolean>;
  getVehicleCount(unitId: string): Promise<number>;
  getUsersCount(unitId: string): Promise<number>;
  fetchVehicleCountByUnit(): Promise<Record<string, number>>;
  fetchUserCountByUnit(): Promise<Record<string, number>>;
  canDeleteUnit(id: string): Promise<{ canDelete: boolean; vehicleCount?: number; usersCount?: number }>;
}

/**
 * Implementação do repositório de unidades usando Supabase
 */
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
    ) || [];
    
    // Mapear os dados do banco para o formato da interface Unit
    return data.map((unit: any) => ({
      id: unit.id,
      name: unit.name,
      code: unit.code,
      address: unit.address || '',
      vehicleCount: 0,
      usersCount: 0,
      createdAt: unit.created_at,
      updatedAt: unit.updated_at,
      createdBy: unit.created_by || null // Garantir que não é undefined
    }));
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
        .single(),
      'Erro ao buscar unidade'
    );
    
    if (!data) return null;
    
    return {
      id: data.id,
      name: data.name,
      code: data.code,
      address: data.address || '',
      vehicleCount: 0,
      usersCount: 0,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      // Usar acesso seguro para created_by, já que pode não existir no tipo retornado
      createdBy: (data as any).created_by || null
    };
  }

  /**
   * Busca uma unidade pelo código
   */
  async findByCode(code: string): Promise<Unit | null> {
    const data = await handleSupabaseRequest(
      async () => await supabase
        .from('units')
        .select('*')
        .eq('code', code)
        .single(),
      'Erro ao buscar unidade pelo código'
    );
    
    if (!data) return null;

    return {
      id: data.id,
      name: data.name,
      code: data.code,
      address: data.address || '',
      vehicleCount: 0,
      usersCount: 0,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      // Usar acesso seguro para created_by, já que pode não existir no tipo retornado
      createdBy: (data as any).created_by || null
    };
  }

  /**
   * Cria uma nova unidade
   */
  async create(unitData: UnitDTO): Promise<Unit | null> {
    const data = await handleSupabaseRequest(
      async () => await supabase
        .from('units')
        .insert([{
          name: unitData.name,
          code: unitData.code,
          address: unitData.address || null
        }])
        .select()
        .single(),
      'Erro ao criar unidade'
    );
    
    return data as Unit | null;
  }

  /**
   * Atualiza uma unidade existente
   */
  async update(id: string, unitData: UnitDTO): Promise<boolean> {
    const result = await handleSupabaseRequest(
      async () => await supabase
        .from('units')
        .update({
          name: unitData.name,
          code: unitData.code,
          address: unitData.address || null,
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
   * Obtém a contagem de veículos por unidade
   */
  async getVehicleCount(unitId: string): Promise<number> {
    const result = await handleSupabaseRequest(
      async () => await supabase
        .from('vehicles')
        .select('id', { count: 'exact', head: true })
        .eq('unit_id', unitId),
      'Erro ao contar veículos da unidade'
    );
    
    // Corrigir o acesso ao count, garantindo o tipo numérico
    if (result && typeof result === 'object' && 'count' in result) {
      const count = result.count;
      return typeof count === 'number' ? count : 0;
    }
    
    return 0;
  }

  /**
   * Obtém a contagem de usuários por unidade
   */
  async getUsersCount(unitId: string): Promise<number> {
    const result = await handleSupabaseRequest(
      async () => await supabase
        .from('system_users')
        .select('id', { count: 'exact', head: true })
        .eq('unit_id', unitId),
      'Erro ao contar usuários da unidade'
    );
    
    // Corrigir o acesso ao count, garantindo o tipo numérico
    if (result && typeof result === 'object' && 'count' in result) {
      const count = result.count;
      return typeof count === 'number' ? count : 0;
    }
    
    return 0;
  }

  /**
   * Busca contagem de veículos por unidade
   */
  async fetchVehicleCountByUnit(): Promise<Record<string, number>> {
    try {
      const counts = await callRPC<{}, any[]>(
        'count_vehicles_by_unit',
        {},
        'Erro ao buscar contagem de veículos por unidade'
      );
      
      const result: Record<string, number> = {};
      
      if (counts && Array.isArray(counts)) {
        counts.forEach((item: any) => {
          if (item && typeof item === 'object' && 'unit_id' in item && 'count' in item) {
            result[item.unit_id] = Number(item.count);
          }
        });
      }
      
      return result;
    } catch (error) {
      console.error('Erro ao buscar contagem de veículos por unidade:', error);
      return {};
    }
  }

  /**
   * Busca contagem de usuários por unidade
   */
  async fetchUserCountByUnit(): Promise<Record<string, number>> {
    try {
      const counts = await callRPC<{}, any[]>(
        'count_users_by_unit',
        {},
        'Erro ao buscar contagem de usuários por unidade'
      );
      
      const result: Record<string, number> = {};
      
      if (counts && Array.isArray(counts)) {
        counts.forEach((item: any) => {
          if (item && typeof item === 'object' && 'unit_id' in item && 'count' in item) {
            result[item.unit_id] = Number(item.count);
          }
        });
      }
      
      return result;
    } catch (error) {
      console.error('Erro ao buscar contagem de usuários por unidade:', error);
      return {};
    }
  }

  /**
   * Verifica se uma unidade pode ser excluída
   */
  async canDeleteUnit(id: string): Promise<{ canDelete: boolean; vehicleCount?: number; usersCount?: number }> {
    const vehicleCount = await this.getVehicleCount(id);
    const usersCount = await this.getUsersCount(id);
    
    const canDelete = vehicleCount === 0 && usersCount === 0;
    
    return { canDelete, vehicleCount, usersCount };
  }
}

/**
 * Instância singleton do repositório
 */
export const unitRepository = new UnitRepository();
