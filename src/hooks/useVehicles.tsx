
import { useState } from 'react';
import { Vehicle, VehicleLocation } from '@/types';
import { useQuery } from '@tanstack/react-query';
import { vehicleService } from '@/services/vehicles/vehicleService';

interface VehicleFilters {
  searchTerm?: string;
  unitId?: string | null;
  location?: VehicleLocation | null;
}

export const useVehicles = (initialFilters?: VehicleFilters) => {
  const [filters, setFilters] = useState({
    search: initialFilters?.searchTerm || '',
    location: initialFilters?.location || null as VehicleLocation | null,
    unitId: initialFilters?.unitId || null as string | null,
  });

  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Fetch vehicles with filters
  const { data: allVehicles = [], isLoading, isError, refetch } = useQuery({
    queryKey: ['vehicles', filters],
    queryFn: async () => {
      // Apply search filter
      if (filters.search) {
        return await vehicleService.searchVehicles(filters.search);
      }
      
      // Apply location filter
      if (filters.location) {
        return await vehicleService.getVehiclesByLocation(filters.location);
      }

      // Apply unit filter
      if (filters.unitId) {
        return await vehicleService.getVehiclesByUnit(filters.unitId);
      }
      
      // No filters, return all vehicles
      return await vehicleService.getAllVehicles();
    }
  });

  // Calculate total pages
  const totalPages = Math.ceil(allVehicles.length / pageSize);
  
  // Get current page data
  const paginatedVehicles = allVehicles.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  // Get vehicles with most movements (mock implementation)
  const topVehicles = [...allVehicles]
    .map(vehicle => ({
      ...vehicle,
      frequency: Math.floor(Math.random() * 50) + 1 // Mock movement count
    }))
    .sort((a, b) => (b.frequency || 0) - (a.frequency || 0))
    .slice(0, 5);

  const handleFilterChange = (name: string, value: string | null) => {
    setFilters(prev => ({ ...prev, [name]: value }));
    setPage(1); // Reset to first page when filters change
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      location: null,
      unitId: null,
    });
    setPage(1);
  };

  return {
    vehicles: paginatedVehicles,
    allVehicles,
    topVehicles,
    isLoading,
    isError,
    filters,
    handleFilterChange,
    resetFilters,
    page,
    setPage,
    totalPages,
    viewMode,
    setViewMode,
    refetch
  };
};
