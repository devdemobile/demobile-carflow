
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Unit } from '@/types';

/**
 * Fetch all units from Supabase with a simplified query to avoid RLS issues
 */
export const fetchUnits = async (): Promise<Unit[]> => {
  try {
    // Simple query first to get basic unit data
    const { data, error } = await supabase
      .from('units')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching units:', error);
      toast.error('Erro ao carregar unidades');
      return [];
    }
    
    // If no data, return empty array
    if (!data || data.length === 0) {
      return [];
    }

    // Transform data to match our Unit type
    const units: Unit[] = await Promise.all(data.map(async (unit) => {
      // Get vehicle count
      const { count: vehicleCount, error: vehicleError } = await supabase
        .from('vehicles')
        .select('*', { count: 'exact', head: true })
        .eq('unit_id', unit.id);
      
      if (vehicleError) {
        console.error('Error counting vehicles:', vehicleError);
      }
      
      // Get user count
      const { count: usersCount, error: usersError } = await supabase
        .from('system_users')
        .select('*', { count: 'exact', head: true })
        .eq('unit_id', unit.id);
      
      if (usersError) {
        console.error('Error counting users:', usersError);
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
    console.error('Error in fetchUnits:', error);
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
      console.error('Error adding unit:', error);
      toast.error('Erro ao adicionar unidade');
      return null;
    }
    
    toast.success('Unidade adicionada com sucesso');
    
    // Return the new unit with counts initialized to 0
    return {
      id: data.id,
      name: data.name,
      code: data.code,
      address: data.address || '',
      vehicleCount: 0,
      usersCount: 0
    };
  } catch (error) {
    console.error('Error in addUnit:', error);
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
      console.error('Error updating unit:', error);
      toast.error('Erro ao atualizar unidade');
      return false;
    }
    
    toast.success('Unidade atualizada com sucesso');
    return true;
  } catch (error) {
    console.error('Error in updateUnit:', error);
    toast.error('Erro ao atualizar unidade');
    return false;
  }
};

/**
 * Delete a unit if it has no dependencies
 */
export const deleteUnit = async (id: string): Promise<boolean> => {
  try {
    // First check if there are vehicles or users associated with this unit
    // Get vehicle count
    const { count: vehicleCount, error: vehicleError } = await supabase
      .from('vehicles')
      .select('*', { count: 'exact', head: true })
      .eq('unit_id', id);
    
    if (vehicleError) {
      console.error('Error checking vehicles:', vehicleError);
      toast.error('Erro ao verificar veículos associados');
      return false;
    }
    
    if (vehicleCount && vehicleCount > 0) {
      toast.error(`Não é possível excluir esta unidade: ela possui ${vehicleCount} veículos associados`);
      return false;
    }
    
    // Get user count
    const { count: usersCount, error: usersError } = await supabase
      .from('system_users')
      .select('*', { count: 'exact', head: true })
      .eq('unit_id', id);
    
    if (usersError) {
      console.error('Error checking users:', usersError);
      toast.error('Erro ao verificar usuários associados');
      return false;
    }
    
    if (usersCount && usersCount > 0) {
      toast.error(`Não é possível excluir esta unidade: ela possui ${usersCount} usuários associados`);
      return false;
    }
    
    // If no dependencies, proceed with deletion
    const { error } = await supabase
      .from('units')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting unit:', error);
      toast.error('Erro ao excluir unidade');
      return false;
    }
    
    toast.success('Unidade excluída com sucesso');
    return true;
  } catch (error) {
    console.error('Error in deleteUnit:', error);
    toast.error('Erro ao excluir unidade');
    return false;
  }
};
