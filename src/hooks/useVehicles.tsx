
import { useState } from 'react';
import { Vehicle, VehicleLocation } from '@/types';
import { useQuery, UseQueryResult, useQueryClient } from '@tanstack/react-query';
import { vehicleService } from '@/services/vehicles/vehicleService';
import { toast } from 'sonner';

interface VehicleFilters {
  search: string;
  location: VehicleLocation | null;
  unitId: string | null;
}

export const useVehicles = (initialFilters?: Partial<VehicleFilters>) => {
  const queryClient = useQueryClient();
  const [filters, setFilters] = useState<VehicleFilters>({
    search: initialFilters?.search || '',
    location: initialFilters?.location || null,
    unitId: initialFilters?.unitId || null,
  });

  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isVehicleDetailsOpen, setIsVehicleDetailsOpen] = useState(false);
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);

  // Fetch vehicles with filters
  const { data: allVehicles = [], isLoading, isError, refetch }: UseQueryResult<Vehicle[], Error> = useQuery({
    queryKey: ['vehicles', filters],
    queryFn: async () => {
      try {
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
      } catch (error: any) {
        toast.error(`Erro ao buscar veículos: ${error.message}`);
        throw error;
      }
    }
  });

  // Calculate total pages
  const totalPages = Math.ceil((allVehicles?.length || 0) / pageSize);
  
  // Get current page data
  const paginatedVehicles = allVehicles ? allVehicles.slice(
    (page - 1) * pageSize,
    page * pageSize
  ) : [];

  // Get vehicles with most movements (mock implementation)
  const topVehicles = allVehicles 
    ? [...allVehicles]
      .map(vehicle => ({
        ...vehicle,
        frequency: Math.floor(Math.random() * 50) + 1 // Mock movement count
      }))
      .sort((a, b) => (b.frequency || 0) - (a.frequency || 0))
      .slice(0, 5)
    : [];

  const handleFilterChange = (name: string, value: any) => {
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

  const openVehicleDetails = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsVehicleDetailsOpen(true);
  };

  const closeVehicleDetails = () => {
    setIsVehicleDetailsOpen(false);
  };

  const openAddVehicle = () => {
    setIsAddVehicleOpen(true);
  };

  const closeAddVehicle = () => {
    setIsAddVehicleOpen(false);
  };

  const refreshVehicles = () => {
    refetch();
  };

  // Add the missing findVehicleByPlate function
  const findVehicleByPlate = async (plate: string): Promise<Vehicle | null> => {
    try {
      return await vehicleService.getVehicleByPlate(plate);
    } catch (error) {
      console.error('Error finding vehicle by plate:', error);
      return null;
    }
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
    refetch: refreshVehicles,
    selectedVehicle,
    isVehicleDetailsOpen,
    openVehicleDetails,
    closeVehicleDetails,
    isAddVehicleOpen,
    openAddVehicle,
    closeAddVehicle,
    findVehicleByPlate // Added the missing function
  };
};
