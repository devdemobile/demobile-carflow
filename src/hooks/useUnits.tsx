
import { useState } from 'react';
import { Unit } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';

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
    refetch
  };
};
