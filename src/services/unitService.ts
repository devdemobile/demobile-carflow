
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Unit } from '@/types';

/**
 * Fetch all units from Supabase com uma query simplificada
 */
export const fetchUnits = async (): Promise<Unit[]> => {
  try {
    // Query básica para obter dados das unidades
    const { data, error } = await supabase
      .from('units')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Erro ao buscar unidades:', error);
      toast.error('Erro ao carregar unidades');
      return [];
    }
    
    if (!data || data.length === 0) {
      return [];
    }

    // Transformar dados para corresponder ao nosso tipo Unit
    const units: Unit[] = await Promise.all(data.map(async (unit) => {
      // Obter contagem de veículos
      const { count: vehicleCount, error: vehicleError } = await supabase
        .from('vehicles')
        .select('*', { count: 'exact', head: true })
        .eq('unit_id', unit.id);
      
      if (vehicleError) {
        console.error('Erro ao contar veículos:', vehicleError);
      }
      
      // Obter contagem de usuários
      const { count: usersCount, error: usersError } = await supabase
        .from('system_users')
        .select('*', { count: 'exact', head: true })
        .eq('unit_id', unit.id);
      
      if (usersError) {
        console.error('Erro ao contar usuários:', usersError);
      }
      
      return {
        id: unit.id,
        name: unit.name,
        code: unit.code,
        address: unit.address || '',
        vehicleCount: vehicleCount || 0,
        usersCount: usersCount || 0
      };
    }));

    return units;
  } catch (error) {
    console.error('Erro em fetchUnits:', error);
    toast.error('Erro ao carregar dados das unidades');
    return [];
  }
};

/**
 * Create a new unit
 */
export const createUnit = async (unitData: { name: string; code: string; address?: string }): Promise<Unit | null> => {
  try {
    const { data, error } = await supabase
      .from('units')
      .insert([{ 
        name: unitData.name,
        code: unitData.code,
        address: unitData.address || '' 
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Erro ao adicionar unidade:', error);
      toast.error('Erro ao adicionar unidade');
      return null;
    }
    
    toast.success('Unidade adicionada com sucesso');
    
    // Retornar a nova unidade com contagens inicializadas em 0
    return {
      id: data.id,
      name: data.name,
      code: data.code,
      address: data.address || '',
      vehicleCount: 0,
      usersCount: 0
    };
  } catch (error) {
    console.error('Erro em addUnit:', error);
    toast.error('Erro ao adicionar unidade');
    return null;
  }
};

/**
 * Update an existing unit
 */
export const updateUnit = async (id: string, unitData: { name: string; code: string; address?: string }): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('units')
      .update({ 
        name: unitData.name,
        code: unitData.code,
        address: unitData.address || '' 
      })
      .eq('id', id);
    
    if (error) {
      console.error('Erro ao atualizar unidade:', error);
      toast.error('Erro ao atualizar unidade');
      return false;
    }
    
    toast.success('Unidade atualizada com sucesso');
    return true;
  } catch (error) {
    console.error('Erro em updateUnit:', error);
    toast.error('Erro ao atualizar unidade');
    return false;
  }
};

/**
 * Delete a unit if it has no dependencies
 */
export const deleteUnit = async (id: string): Promise<boolean> => {
  try {
    // Primeiro verificar se existem veículos ou usuários associados a esta unidade
    // Obter contagem de veículos
    const { count: vehicleCount, error: vehicleError } = await supabase
      .from('vehicles')
      .select('*', { count: 'exact', head: true })
      .eq('unit_id', id);
    
    if (vehicleError) {
      console.error('Erro ao verificar veículos:', vehicleError);
      toast.error('Erro ao verificar veículos associados');
      return false;
    }
    
    if (vehicleCount && vehicleCount > 0) {
      toast.error(`Não é possível excluir esta unidade: ela possui ${vehicleCount} veículos associados`);
      return false;
    }
    
    // Obter contagem de usuários
    const { count: usersCount, error: usersError } = await supabase
      .from('system_users')
      .select('*', { count: 'exact', head: true })
      .eq('unit_id', id);
    
    if (usersError) {
      console.error('Erro ao verificar usuários:', usersError);
      toast.error('Erro ao verificar usuários associados');
      return false;
    }
    
    if (usersCount && usersCount > 0) {
      toast.error(`Não é possível excluir esta unidade: ela possui ${usersCount} usuários associados`);
      return false;
    }
    
    // Se não houver dependências, prosseguir com a exclusão
    const { error } = await supabase
      .from('units')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Erro ao excluir unidade:', error);
      toast.error('Erro ao excluir unidade');
      return false;
    }
    
    toast.success('Unidade excluída com sucesso');
    return true;
  } catch (error) {
    console.error('Erro em deleteUnit:', error);
    toast.error('Erro ao excluir unidade');
    return false;
  }
};
