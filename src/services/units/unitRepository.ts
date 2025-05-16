
/**
 * Repositório para operações com unidades
 */
import { supabase } from '@/integrations/supabase/client';
import { Unit, UnitDTO } from '@/types';
import { handleSupabaseRequest } from '../api/supabase';

/**
 * Busca todas as unidades
 */
export const fetchUnits = async (): Promise<Unit[]> => {
  const data = await handleSupabaseRequest<any[]>(
    () => supabase.from('units').select('*').order('name'),
    'Erro ao carregar unidades'
  );
  
  if (!data || data.length === 0) {
    return [];
  }
  
  // Mapeia para o formato Unit
  return data.map(unit => ({
    id: unit.id,
    name: unit.name,
    code: unit.code,
    address: unit.address || '',
    vehicleCount: 0,
    usersCount: 0
  }));
};

/**
 * Busca as contagens de veículos por unidade
 */
export const fetchVehicleCountByUnit = async (): Promise<Record<string, number>> => {
  const data = await handleSupabaseRequest<any[]>(
    () => supabase.from('vehicles').select('unit_id'),
    'Erro ao contar veículos'
  );
  
  if (!data) return {};
  
  // Conta manualmente por unit_id
  const counts: Record<string, number> = {};
  data.forEach(vehicle => {
    if (vehicle.unit_id) {
      counts[vehicle.unit_id] = (counts[vehicle.unit_id] || 0) + 1;
    }
  });
  
  return counts;
};

/**
 * Busca as contagens de usuários por unidade
 */
export const fetchUserCountByUnit = async (): Promise<Record<string, number>> => {
  const data = await handleSupabaseRequest<any[]>(
    () => supabase.from('system_users').select('unit_id'),
    'Erro ao contar usuários'
  );
  
  if (!data) return {};
  
  // Conta manualmente por unit_id
  const counts: Record<string, number> = {};
  data.forEach(user => {
    if (user.unit_id) {
      counts[user.unit_id] = (counts[user.unit_id] || 0) + 1;
    }
  });
  
  return counts;
};

/**
 * Cria uma nova unidade
 */
export const createUnit = async (unitData: UnitDTO): Promise<Unit | null> => {
  const data = await handleSupabaseRequest<any[]>(
    () => supabase
      .from('units')
      .insert([{ 
        name: unitData.name,
        code: unitData.code,
        address: unitData.address || '' 
      }])
      .select(),
    'Erro ao adicionar unidade'
  );
  
  if (!data || data.length === 0) {
    return null;
  }
  
  const newUnit: Unit = {
    id: data[0].id,
    name: data[0].name,
    code: data[0].code,
    address: data[0].address || '',
    vehicleCount: 0,
    usersCount: 0
  };
  
  return newUnit;
};

/**
 * Atualiza uma unidade existente
 */
export const updateUnit = async (id: string, unitData: UnitDTO): Promise<boolean> => {
  const result = await handleSupabaseRequest<null>(
    () => supabase
      .from('units')
      .update({ 
        name: unitData.name,
        code: unitData.code,
        address: unitData.address || '' 
      })
      .eq('id', id),
    'Erro ao atualizar unidade'
  );
  
  return result !== null;
};

/**
 * Verifica se uma unidade pode ser excluída
 */
export const canDeleteUnit = async (id: string): Promise<{canDelete: boolean, vehicleCount?: number, usersCount?: number}> => {
  // Verificar se há veículos associados
  const vehicleData = await handleSupabaseRequest<{count: number}>(
    () => supabase
      .from('vehicles')
      .select('*', { count: 'exact', head: true })
      .eq('unit_id', id),
    'Erro ao verificar veículos associados'
  );
  
  const vehicleCount = vehicleData?.count || 0;
  
  if (vehicleCount > 0) {
    return { canDelete: false, vehicleCount };
  }
  
  // Verificar se há usuários associados
  const userData = await handleSupabaseRequest<{count: number}>(
    () => supabase
      .from('system_users')
      .select('*', { count: 'exact', head: true })
      .eq('unit_id', id),
    'Erro ao verificar usuários associados'
  );
  
  const usersCount = userData?.count || 0;
  
  if (usersCount > 0) {
    return { canDelete: false, usersCount };
  }
  
  return { canDelete: true };
};

/**
 * Exclui uma unidade
 */
export const deleteUnit = async (id: string): Promise<boolean> => {
  const result = await handleSupabaseRequest<null>(
    () => supabase
      .from('units')
      .delete()
      .eq('id', id),
    'Erro ao excluir unidade'
  );
  
  return result !== null;
};
