
import { useState } from 'react';
import { Unit } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useUnits = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch units from Supabase with search filter
  const fetchUnits = async (): Promise<Unit[]> => {
    let query = supabase
      .from('units')
      .select('*');
    
    // Apply search filter if provided
    if (searchTerm) {
      query = query.or(
        `name.ilike.%${searchTerm}%,code.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%`
      );
    }

    // Execute the query
    const { data, error } = await query.order('name', { ascending: true });
    
    if (error) {
      console.error('Error fetching units:', error);
      return [];
    }
    
    // For each unit, fetch the count of vehicles and users
    const unitsWithCounts = await Promise.all((data || []).map(async unit => {
      // Count vehicles for this unit
      const { count: vehicleCount, error: vehicleError } = await supabase
        .from('vehicles')
        .select('*', { count: 'exact', head: true })
        .eq('unit_id', unit.id);
      
      if (vehicleError) {
        console.error('Error counting vehicles:', vehicleError);
      }
      
      // Count users for this unit
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

    return unitsWithCounts;
  };

  // Add a new unit to the database
  const addUnit = async (unitData: { name: string; code: string; address?: string }): Promise<Unit | null> => {
    const { data, error } = await supabase
      .from('units')
      .insert([
        { 
          name: unitData.name,
          code: unitData.code,
          address: unitData.address
        }
      ])
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
  };

  // Update an existing unit
  const updateUnit = async (id: string, unitData: { name: string; code: string; address?: string }): Promise<boolean> => {
    const { error } = await supabase
      .from('units')
      .update({ 
        name: unitData.name,
        code: unitData.code,
        address: unitData.address
      })
      .eq('id', id);
    
    if (error) {
      console.error('Error updating unit:', error);
      toast.error('Erro ao atualizar unidade');
      return false;
    }
    
    toast.success('Unidade atualizada com sucesso');
    return true;
  };

  // Delete a unit
  const deleteUnit = async (id: string): Promise<boolean> => {
    // First check if there are vehicles or users associated with this unit
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
    
    // If no vehicles or users are associated, proceed with deletion
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
  };

  const { data: units = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['units', searchTerm],
    queryFn: fetchUnits
  });

  return {
    units,
    searchTerm,
    setSearchTerm,
    isLoading,
    isError,
    refetch,
    addUnit,
    updateUnit,
    deleteUnit
  };
};
