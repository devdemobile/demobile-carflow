
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Unit } from '@/types';

/**
 * Fetch all units from Supabase
 */
export const fetchUnits = async (): Promise<Unit[]> => {
  try {
    // Execute the query using service_role key to bypass RLS if needed
    const { data, error } = await supabase
      .from('units')
      .select('id, name, code, address')
      .order('name', { ascending: true });
    
    if (error) {
      console.error('Error fetching units:', error);
      toast.error('Erro ao carregar unidades');
      return [];
    }
    
    // Process units without additional queries for improved performance
    const unitsWithCounts = data.map(unit => ({
      id: unit.id,
      name: unit.name,
      code: unit.code,
      address: unit.address || '',
      vehicleCount: 0,
      usersCount: 0
    }));

    return unitsWithCounts;
  } catch (error) {
    console.error('Error in fetchUnits:', error);
    toast.error('Erro ao carregar dados');
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
        address: unitData.address || '' // Ensure address is never null
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
        address: unitData.address || '' // Ensure address is never null
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
 * Check if a unit has associated vehicles or users
 */
export const checkUnitDependencies = async (id: string): Promise<{vehicleCount: number, usersCount: number, error: boolean}> => {
  try {
    // Check for vehicles
    const { count: vehicleCount, error: vehicleError } = await supabase
      .from('vehicles')
      .select('*', { count: 'exact', head: true })
      .eq('unit_id', id);
    
    if (vehicleError) {
      console.error('Error checking vehicles:', vehicleError);
      toast.error('Erro ao verificar veículos associados');
      return { vehicleCount: 0, usersCount: 0, error: true };
    }
    
    // Check for users
    const { count: usersCount, error: usersError } = await supabase
      .from('system_users')
      .select('*', { count: 'exact', head: true })
      .eq('unit_id', id);
    
    if (usersError) {
      console.error('Error checking users:', usersError);
      toast.error('Erro ao verificar usuários associados');
      return { vehicleCount: vehicleCount || 0, usersCount: 0, error: true };
    }
    
    return { 
      vehicleCount: vehicleCount || 0, 
      usersCount: usersCount || 0, 
      error: false 
    };
  } catch (error) {
    console.error('Error checking unit dependencies:', error);
    return { vehicleCount: 0, usersCount: 0, error: true };
  }
};

/**
 * Delete a unit
 */
export const deleteUnit = async (id: string): Promise<boolean> => {
  try {
    // First check if there are vehicles or users associated with this unit
    const { vehicleCount, usersCount, error } = await checkUnitDependencies(id);
    
    if (error) {
      return false;
    }
    
    if (vehicleCount > 0) {
      toast.error(`Não é possível excluir esta unidade: ela possui ${vehicleCount} veículos associados`);
      return false;
    }
    
    if (usersCount > 0) {
      toast.error(`Não é possível excluir esta unidade: ela possui ${usersCount} usuários associados`);
      return false;
    }
    
    // If no vehicles or users are associated, proceed with deletion
    const { error: deleteError } = await supabase
      .from('units')
      .delete()
      .eq('id', id);
    
    if (deleteError) {
      console.error('Error deleting unit:', deleteError);
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
