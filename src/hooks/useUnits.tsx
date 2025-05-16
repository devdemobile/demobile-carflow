
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Unit } from '@/types';
import { fetchUnits, createUnit, updateUnit, deleteUnit } from '@/services/unitService';
import { useMediaQuery } from '@/hooks/use-mobile';

/**
 * Hook for managing units data and operations with responsive view mode
 */
export const useUnits = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  
  // Use media query to determine default view mode
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  
  // Fetch units with React Query
  const { 
    data: allUnits = [], 
    isLoading, 
    isError, 
    refetch 
  } = useQuery({
    queryKey: ['units'],
    queryFn: fetchUnits,
    refetchOnWindowFocus: true,
    retry: 1,
    staleTime: 30000 // 30 seconds
  });

  // Filter units by search term
  const units = searchTerm 
    ? allUnits.filter(unit => {
        const term = searchTerm.toLowerCase();
        return unit.name.toLowerCase().includes(term) || 
               unit.code.toLowerCase().includes(term) || 
               (unit.address && unit.address.toLowerCase().includes(term));
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
    viewMode,
    setViewMode,
    isDesktop,
    isLoading,
    isError,
    refetch,
    addUnit,
    updateUnit: handleUpdateUnit,
    deleteUnit: handleDeleteUnit
  };
};
