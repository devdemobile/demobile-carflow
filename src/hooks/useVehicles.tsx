
import { useState } from 'react';
import { Vehicle, VehicleLocation } from '@/types';
import { useQuery, UseQueryResult, useQueryClient } from '@tanstack/react-query';
import { vehicleService } from '@/services/vehicles/vehicleService';
import { toast } from 'sonner';
import { useVehicleMakes } from './useVehicleMakes';
import { useVehicleModels } from './useVehicleModels';
import { useUnits } from './useUnits';

// Export the interface so it can be imported elsewhere
export interface VehicleFilters {
  search: string;
  plate?: string;
  make?: string;
  model?: string;
  status?: string;
  location: VehicleLocation | null;
  unitId: string | null;
}

export const useVehicles = (initialFilters?: Partial<VehicleFilters>) => {
  const queryClient = useQueryClient();
  const { makes } = useVehicleMakes();
  const { models } = useVehicleModels();
  const { units } = useUnits();
  
  const [filters, setFilters] = useState<VehicleFilters>({
    search: initialFilters?.search || '',
    plate: initialFilters?.plate || '',
    make: initialFilters?.make || '',
    model: initialFilters?.model || '',
    status: initialFilters?.status || '',
    location: initialFilters?.location || null,
    unitId: initialFilters?.unitId || null,
  });

  const [page, setPage] = useState(1);
  const [pageSize] = useState(12);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isVehicleDetailsOpen, setIsVehicleDetailsOpen] = useState(false);
  const [isAddVehicleOpen, setIsAddVehicleOpen] = useState(false);

  // Preparar dados para os filtros de dropdown
  const makeOptions = makes.map(make => ({ value: make.id, label: make.name }));
  const modelOptions = models.map(model => ({ value: model.id, label: model.name }));
  const unitOptions = units.map(unit => ({ value: unit.id, label: unit.name }));

  // Fetch vehicles with filters
  const { data: allVehicles = [], isLoading, isError, refetch }: UseQueryResult<Vehicle[], Error> = useQuery({
    queryKey: ['vehicles', filters],
    queryFn: async () => {
      try {
        let filteredVehicles: Vehicle[] = [];
        
        // Primeiro buscamos todos os veículos
        filteredVehicles = await vehicleService.getAllVehicles();
        
        // Aplicamos os filtros sequencialmente
        
        // Filtrar por status
        if (filters.status && filters.status !== 'all') {
          filteredVehicles = filteredVehicles.filter(v => 
            v.location === filters.status
          );
        }
        
        // Filtrar por marca
        if (filters.make && filters.make !== 'all') {
          filteredVehicles = filteredVehicles.filter(v => 
            v.makeId === filters.make || v.make === filters.make
          );
        }
        
        // Filtrar por modelo
        if (filters.model && filters.model !== 'all') {
          filteredVehicles = filteredVehicles.filter(v => 
            v.modelId === filters.model || v.model === filters.model
          );
        }
        
        // Filtrar por unidade
        if (filters.unitId && filters.unitId !== 'all') {
          filteredVehicles = filteredVehicles.filter(v => 
            v.unitId === filters.unitId
          );
        }
        
        // Filtrar por placa
        if (filters.plate) {
          const normalizedPlate = filters.plate.toLowerCase().trim();
          filteredVehicles = filteredVehicles.filter(v => 
            v.plate.toLowerCase().includes(normalizedPlate)
          );
        }

        // Filtrar por busca geral (aplicado ao final)
        if (filters.search) {
          const normalizedSearch = filters.search.toLowerCase().trim();
          filteredVehicles = filteredVehicles.filter(v =>
            v.plate.toLowerCase().includes(normalizedSearch) ||
            v.make.toLowerCase().includes(normalizedSearch) ||
            v.model.toLowerCase().includes(normalizedSearch) ||
            v.color.toLowerCase().includes(normalizedSearch) ||
            (v.year?.toString() || '').includes(normalizedSearch) ||
            v.unitName?.toLowerCase().includes(normalizedSearch) ||
            (v.location === 'yard' && 'pátio'.includes(normalizedSearch)) ||
            (v.location === 'out' && 'rota'.includes(normalizedSearch))
          );
        }
        
        return filteredVehicles;
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
      plate: '',
      make: '',
      model: '',
      status: '',
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

  // Find vehicle by plate function
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
    findVehicleByPlate,
    makeOptions,
    modelOptions,
    unitOptions
  };
};
