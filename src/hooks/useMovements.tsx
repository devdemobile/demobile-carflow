
import { useState, useMemo } from 'react';
import { Movement, VehicleLocation } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { movementService } from '@/services/movements/movementService';

export const useMovements = () => {
  const [filters, setFilters] = useState({
    search: '',
    status: null as VehicleLocation | null,
    dateRange: '',
  });

  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Fetch movements with React Query
  const { data: movements = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['movements', filters],
    queryFn: async () => {
      try {
        // Apply search filter
        if (filters.search) {
          return await movementService.searchMovements(filters.search);
        }
        
        // Apply status filter
        if (filters.status) {
          return await movementService.getMovementsByStatus(filters.status);
        }
        
        // No filters, fetch all movements
        return await movementService.getAllMovements();
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
    return movements.slice(start, end);
  }, [movements, page, pageSize]);

  // Calculate total pages
  const totalPages = Math.ceil(movements.length / pageSize);
  
  return {
    movements: paginatedMovements,
    totalCount: movements.length,
    isLoading,
    isError,
    page,
    setPage,
    totalPages,
    filters,
    handleFilterChange,
    resetFilters,
    refetch
  };
};
