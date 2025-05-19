
import { useState, useEffect } from 'react';
import { Vehicle, VehicleLocation } from '@/types';
import { useQuery, UseQueryResult, useQueryClient } from '@tanstack/react-query';
import { vehicleService } from '@/services/vehicles/vehicleService';
import { toast } from 'sonner';
import { useVehicleMakes } from './useVehicleMakes';
import { useVehicleModels } from './useVehicleModels';
import { useUnits } from './useUnits';
import { movementService } from '@/services/movements/movementService';
import { checkSupabaseConnection } from '@/services/api/supabase';

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
  const [connectionOk, setConnectionOk] = useState<boolean | null>(null);
  
  const [filters, setFilters] = useState<VehicleFilters>({
    search: initialFilters?.search || '',
    plate: initialFilters?.plate || '',
    make: initialFilters?.make || '',
    model: initialFilters?.model || '',
    status: initialFilters?.status || '',
    location: initialFilters?.location || null,
    unitId: initialFilters?.unitId || null,
  });

  // Verificar conexão ao montar o componente
  useEffect(() => {
    const verifyConnection = async () => {
      const isConnected = await checkSupabaseConnection();
      setConnectionOk(isConnected);
      
      if (!isConnected) {
        toast.error("Não foi possível conectar ao servidor. Verifique sua conexão.");
      }
    };
    
    verifyConnection();
  }, []);

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
  const { data: allVehicles = [], isLoading, isError, refetch, error }: UseQueryResult<Vehicle[], Error> = useQuery({
    queryKey: ['vehicles', filters],
    queryFn: async () => {
      console.log("Executando query de veículos com filtros:", filters);
      
      try {
        let filteredVehicles: Vehicle[] = [];
        
        // Primeiro buscamos todos os veículos
        filteredVehicles = await vehicleService.getAllVehicles();
        console.log("Veículos obtidos:", filteredVehicles.length);
        
        // Para veículos em rota, buscar os respectivos destinos das movimentações ativas
        const promises = filteredVehicles.map(async (vehicle) => {
          if (vehicle.location === 'out') {
            try {
              // Buscar movimentações do veículo
              const movements = await movementService.getMovementsByVehicle(vehicle.id);
              
              // Encontrar a movimentação de saída mais recente (status 'out')
              const activeMovement = movements
                .filter(m => m.status === 'out' && m.type === 'exit')
                .sort((a, b) => {
                  const dateA = new Date(`${a.departureDate}T${a.departureTime}`);
                  const dateB = new Date(`${b.departureDate}T${b.departureTime}`);
                  return dateB.getTime() - dateA.getTime();
                })[0];
              
              // Se encontrar uma movimentação ativa, atualizar o destino do veículo
              if (activeMovement && activeMovement.destination) {
                vehicle.destination = activeMovement.destination;
              }
            } catch (error) {
              console.error('Erro ao buscar destino do veículo:', error);
            }
          }
          return vehicle;
        });
        
        // Esperar todas as consultas terminarem
        await Promise.all(promises);
        
        // Aplicar filtros
        filteredVehicles = applyFilters(filteredVehicles, filters);
        return filteredVehicles;
      } catch (error: any) {
        console.error("Erro na consulta:", error);
        toast.error(`Erro ao buscar veículos: ${error.message}`);
        throw error;
      }
    },
    enabled: connectionOk === true,
    meta: {
      onError: (err: Error) => {
        console.error("Erro na query:", err);
        toast.error(`Erro ao buscar veículos: ${err.message}`);
      }
    }
  });

  // Função para aplicar filtros
  const applyFilters = (vehicles: Vehicle[], filters: VehicleFilters): Vehicle[] => {
    let result = [...vehicles];
    
    // Filtrar por status
    if (filters.status && filters.status !== 'all') {
      result = result.filter(v => v.location === filters.status);
    }
    
    // Filtrar por marca
    if (filters.make && filters.make !== 'all') {
      result = result.filter(v => v.makeId === filters.make || v.make === filters.make);
    }
    
    // Filtrar por modelo
    if (filters.model && filters.model !== 'all') {
      result = result.filter(v => v.modelId === filters.model || v.model === filters.model);
    }
    
    // Filtrar por unidade
    if (filters.unitId && filters.unitId !== 'all') {
      result = result.filter(v => v.unitId === filters.unitId);
    }
    
    // Filtrar por placa
    if (filters.plate) {
      const normalizedPlate = filters.plate.toLowerCase().trim();
      result = result.filter(v => v.plate.toLowerCase().includes(normalizedPlate));
    }
    
    // Filtrar por busca geral
    if (filters.search) {
      const normalizedSearch = filters.search.toLowerCase().trim();
      result = result.filter(v =>
        v.plate.toLowerCase().includes(normalizedSearch) ||
        v.make.toLowerCase().includes(normalizedSearch) ||
        v.model.toLowerCase().includes(normalizedSearch) ||
        v.color.toLowerCase().includes(normalizedSearch) ||
        (v.year?.toString() || '').includes(normalizedSearch) ||
        v.unitName?.toLowerCase().includes(normalizedSearch) ||
        (v.location === 'yard' && 'pátio'.includes(normalizedSearch)) ||
        (v.location === 'out' && 'rota'.includes(normalizedSearch)) ||
        (v.destination?.toLowerCase() || '').includes(normalizedSearch)
      );
    }
    
    return result;
  };

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
    topVehicles: allVehicles 
      ? [...allVehicles]
        .map(vehicle => ({
          ...vehicle,
          frequency: Math.floor(Math.random() * 50) + 1
        }))
        .sort((a, b) => (b.frequency || 0) - (a.frequency || 0))
        .slice(0, 5)
      : [],
    isLoading,
    isError,
    error,
    filters,
    handleFilterChange: (name: string, value: any) => {
      setFilters(prev => ({ ...prev, [name]: value }));
      setPage(1);
    },
    resetFilters: () => {
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
    },
    page,
    setPage,
    totalPages,
    viewMode,
    setViewMode,
    refetch: async () => {
      console.log("Atualizando dados de veículos...");
      await refetch();
    },
    selectedVehicle,
    isVehicleDetailsOpen,
    openVehicleDetails: (vehicle: Vehicle) => {
      setSelectedVehicle(vehicle);
      setIsVehicleDetailsOpen(true);
    },
    closeVehicleDetails: () => {
      setIsVehicleDetailsOpen(false);
    },
    isAddVehicleOpen,
    openAddVehicle: () => {
      setIsAddVehicleOpen(true);
    },
    closeAddVehicle: () => {
      setIsAddVehicleOpen(false);
    },
    findVehicleByPlate: async (plate: string): Promise<Vehicle | null> => {
      try {
        return await vehicleService.getVehicleByPlate(plate);
      } catch (error) {
        console.error('Error finding vehicle by plate:', error);
        return null;
      }
    },
    makeOptions,
    modelOptions,
    unitOptions,
    connectionOk
  };
};
