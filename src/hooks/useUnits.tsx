
import { useState } from 'react';
import { Unit } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';

export const useUnits = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch units from Supabase with search filter
  const fetchUnits = async (): Promise<Unit[]> => {
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
      
      // Filter by search term on the client side if needed
      let filteredUnits = data || [];
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filteredUnits = filteredUnits.filter(unit => 
          unit.name.toLowerCase().includes(term) || 
          unit.code.toLowerCase().includes(term) || 
          (unit.address && unit.address.toLowerCase().includes(term))
        );
      }
      
      // Process units without additional queries for improved performance
      const unitsWithCounts = filteredUnits.map(unit => ({
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

  // Add a new unit to the database
  const addUnit = async (unitData: { name: string; code: string; address?: string }): Promise<Unit | null> => {
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

  // Update an existing unit
  const updateUnit = async (id: string, unitData: { name: string; code: string; address?: string }): Promise<boolean> => {
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

  // Delete a unit
  const deleteUnit = async (id: string): Promise<boolean> => {
    try {
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
    } catch (error) {
      console.error('Error in deleteUnit:', error);
      toast.error('Erro ao excluir unidade');
      return false;
    }
  };

  const { data: units = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['units', searchTerm],
    queryFn: fetchUnits,
    staleTime: 5000, // Short stale time to allow for frequent refreshes
    refetchOnWindowFocus: true // Refetch when window gains focus
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
