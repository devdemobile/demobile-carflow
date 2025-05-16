
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Unit } from '@/types';
import { fetchUnits, createUnit, updateUnit, deleteUnit } from '@/services/unitService';

/**
 * Hook for managing units data and operations
 */
export const useUnits = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch units with React Query
  const { 
    data: allUnits = [], 
    isLoading, 
    isError, 
    refetch 
  } = useQuery({
    queryKey: ['units'],
    queryFn: fetchUnits,
    staleTime: 5000, // Short stale time to allow for frequent refreshes
    refetchOnWindowFocus: true // Refetch when window gains focus
  });

  // Filter units by search term on the client side
  const units = searchTerm 
    ? allUnits.filter(unit => {
        const term = searchTerm.toLowerCase();
        return unit.name.toLowerCase().includes(term) || 
               unit.code.toLowerCase().includes(term) || 
               unit.address.toLowerCase().includes(term);
      })
    : allUnits;

  // Add a new unit
  const addUnit = async (unitData: { name: string; code: string; address?: string }): Promise<Unit | null> => {
    const result = await createUnit(unitData);
    if (result) {
      await refetch();
    }
    return result;
  };

  // Update an existing unit
  const handleUpdateUnit = async (id: string, unitData: { name: string; code: string; address?: string }): Promise<boolean> => {
    const success = await updateUnit(id, unitData);
    if (success) {
      await refetch();
    }
    return success;
  };

  // Delete a unit
  const handleDeleteUnit = async (id: string): Promise<boolean> => {
    const success = await deleteUnit(id);
    if (success) {
      await refetch();
    }
    return success;
  };

  return {
    units,
    searchTerm,
    setSearchTerm,
    isLoading,
    isError,
    refetch,
    addUnit,
    updateUnit: handleUpdateUnit,
    deleteUnit: handleDeleteUnit
  };
};
