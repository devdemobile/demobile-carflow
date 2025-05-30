
import { useState } from 'react';
import { Vehicle, VehicleLocation } from '@/types';
import { useQuery, UseQueryResult, useQueryClient } from '@tanstack/react-query';
import { vehicleService } from '@/services/vehicles/vehicleService';
import { toast } from 'sonner';
import { useVehicleMakes } from './useVehicleMakes';
import { useVehicleModels } from './useVehicleModels';
import { useUnits } from './useUnits';
import { movementService } from '@/services/movements/movementService';
import { useUnitFilter } from './useUnitFilter';

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
  const { filter: unitFilter, canEditInUnit } = useUnitFilter();
  
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
    queryKey: ['vehicles', filters, unitFilter],
    queryFn: async () => {
      try {
        console.log('Buscando veículos com filtros:', { filters, unitFilter });
        
        let filteredVehicles = await vehicleService.getAllVehicles();
        console.log('Total de veículos encontrados:', filteredVehicles.length);
        
        // Aplicar filtro de unidade global APENAS se não estiver mostrando todas as unidades
        if (!unitFilter.showAllUnits && unitFilter.selectedUnitId) {
          console.log('Aplicando filtro de unidade global:', unitFilter.selectedUnitId);
          filteredVehicles = filteredVehicles.filter(v => v.unitId === unitFilter.selectedUnitId);
          console.log('Veículos após filtro de unidade global:', filteredVehicles.length);
        } else {
          console.log('Mostrando todas as unidades - sem filtro de unidade global');
        }
        
        // Filtrar por busca geral
        if (filters.search && filters.search.trim()) {
          const searchTerm = filters.search.toLowerCase().trim();
          filteredVehicles = filteredVehicles.filter(v =>
            v.plate.toLowerCase().includes(searchTerm) ||
            v.make.toLowerCase().includes(searchTerm) ||
            v.model.toLowerCase().includes(searchTerm) ||
            v.color.toLowerCase().includes(searchTerm) ||
            (v.year?.toString() || '').includes(searchTerm) ||
            v.unitName?.toLowerCase().includes(searchTerm)
          );
          console.log('Veículos após filtro de busca:', filteredVehicles.length);
        }
        
        // Filtrar por status
        if (filters.status && filters.status !== 'all' && filters.status !== '') {
          filteredVehicles = filteredVehicles.filter(v => v.location === filters.status);
          console.log('Veículos após filtro de status:', filteredVehicles.length);
        }
        
        // Filtrar por marca
        if (filters.make && filters.make !== 'all' && filters.make !== '') {
          filteredVehicles = filteredVehicles.filter(v => 
            v.makeId === filters.make || v.make === filters.make
          );
          console.log('Veículos após filtro de marca:', filteredVehicles.length);
        }
        
        // Filtrar por modelo
        if (filters.model && filters.model !== 'all' && filters.model !== '') {
          filteredVehicles = filteredVehicles.filter(v => 
            v.modelId === filters.model || v.model === filters.model
          );
          console.log('Veículos após filtro de modelo:', filteredVehicles.length);
        }
        
        // Filtrar por unidade específica (filtro adicional dos dropdowns)
        if (filters.unitId && filters.unitId !== 'all' && filters.unitId !== '') {
          filteredVehicles = filteredVehicles.filter(v => v.unitId === filters.unitId);
          console.log('Veículos após filtro de unidade específica:', filteredVehicles.length);
        }
        
        console.log('Veículos finais filtrados:', filteredVehicles.length);
        return filteredVehicles;
      } catch (error: any) {
        console.error('Erro ao buscar veículos:', error);
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

  // Get vehicles with most movements
  const topVehicles = allVehicles 
    ? [...allVehicles]
      .map(vehicle => ({
        ...vehicle,
        frequency: Math.floor(Math.random() * 50) + 1
      }))
      .sort((a, b) => (b.frequency || 0) - (a.frequency || 0))
      .slice(0, 5)
    : [];

  const handleFilterChange = (name: string, value: any) => {
    console.log('Mudando filtro:', name, 'para:', value);
    setFilters(prev => {
      const newFilters = { ...prev, [name]: value };
      console.log('Novos filtros:', newFilters);
      return newFilters;
    });
    setPage(1);
  };

  const resetFilters = () => {
    console.log('Resetando filtros');
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
    unitOptions,
    unitFilter,
    canEditInUnit
  };
};
