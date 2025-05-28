
import { useState, useMemo } from 'react';
import { Movement, VehicleLocation } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { movementService } from '@/services/movements/movementService';
import { useUnitFilter } from './useUnitFilter';

export const useMovements = () => {
  const { filter: unitFilter } = useUnitFilter();
  const [filters, setFilters] = useState({
    search: '',
    status: null as VehicleLocation | null,
    dateRange: '',
  });

  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Fetch movements with React Query including unit filter
  const { 
    data: allMovements = [], 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['movements', filters, unitFilter],
    queryFn: async () => {
      try {
        let movements: Movement[] = [];
        
        // Apply search filter
        if (filters.search) {
          movements = await movementService.searchMovements(filters.search);
        }
        // Apply status filter
        else if (filters.status) {
          movements = await movementService.getMovementsByStatus(filters.status);
        }
        // No specific filters, fetch all movements
        else {
          movements = await movementService.getAllMovements();
        }
        
        // Apply unit filter
        if (!unitFilter.showAllUnits && unitFilter.selectedUnitId) {
          movements = movements.filter(movement => 
            movement.departureUnitId === unitFilter.selectedUnitId || 
            movement.arrivalUnitId === unitFilter.selectedUnitId
          );
        }
        
        return movements;
      } catch (error) {
        console.error('Error fetching movements:', error);
        return [];
      }
    }
  });

  const handleFilterChange = (name: string, value: string | null) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1); // Reset to first page when filters change
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      status: null,
      dateRange: '',
    });
    setPage(1);
  };

  // Paginate movements
  const paginatedMovements = useMemo(() => {
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return allMovements.slice(start, end);
  }, [allMovements, page, pageSize]);

  // Calculate total pages
  const totalPages = Math.ceil(allMovements.length / pageSize);
  
  return {
    movements: paginatedMovements,
    totalCount: allMovements.length,
    isLoading,
    isError,
    error,
    page,
    setPage,
    totalPages,
    filters,
    handleFilterChange,
    resetFilters,
    refetch,
    unitFilter
  };
};
