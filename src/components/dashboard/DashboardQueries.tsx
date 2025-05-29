
import { useQuery } from '@tanstack/react-query';
import { movementService } from '@/services/movements/movementService';
import { vehicleService } from '@/services/vehicles/vehicleService';

export const useDashboardQueries = (user: any, filter: any) => {
  // Fetch vehicle stats - filtrados por unidade selecionada
  const vehicleStatsQuery = useQuery({
    queryKey: ['vehicle-stats', filter.selectedUnitId, filter.showAllUnits],
    queryFn: async () => {
      try {
        console.log('Buscando veículos para estatísticas...');
        const allVehicles = await vehicleService.getAllVehicles();
        console.log('Veículos encontrados:', allVehicles.length);
        
        let filteredVehicles = allVehicles;
        if (!filter.showAllUnits && filter.selectedUnitId) {
          filteredVehicles = allVehicles.filter(v => v.unitId === filter.selectedUnitId);
        }
        
        const totalVehicles = filteredVehicles.length;
        const vehiclesInYard = filteredVehicles.filter(v => v.location === 'yard').length;
        const vehiclesOut = filteredVehicles.filter(v => v.location === 'out').length;
        
        console.log('Estatísticas calculadas:', { totalVehicles, vehiclesInYard, vehiclesOut });
        return { totalVehicles, vehiclesInYard, vehiclesOut };
      } catch (error) {
        console.error('Erro ao buscar estatísticas de veículos:', error);
        return { totalVehicles: 0, vehiclesInYard: 0, vehiclesOut: 0 };
      }
    },
    enabled: !!user
  });
  
  // Fetch today's movements - filtradas por unidade selecionada
  const todayMovementsQuery = useQuery({
    queryKey: ['today-movements-count', filter.selectedUnitId, filter.showAllUnits],
    queryFn: async () => {
      try {
        console.log('Buscando movimentações de hoje...');
        const allMovements = await movementService.getAllMovements();
        console.log('Movimentações encontradas:', allMovements.length);
        
        const today = new Date().toISOString().split('T')[0];
        let filteredMovements = allMovements.filter(m => m.departureDate === today);
        
        if (!filter.showAllUnits && filter.selectedUnitId) {
          filteredMovements = filteredMovements.filter(m => 
            m.departureUnitId === filter.selectedUnitId || 
            m.arrivalUnitId === filter.selectedUnitId
          );
        }
        
        console.log('Movimentações de hoje filtradas:', filteredMovements.length);
        return filteredMovements.length;
      } catch (error) {
        console.error('Erro ao buscar movimentações de hoje:', error);
        return 0;
      }
    },
    enabled: !!user
  });
  
  // Fetch recent movements - filtradas por unidade selecionada
  const recentMovementsQuery = useQuery({
    queryKey: ['recent-movements', filter.selectedUnitId, filter.showAllUnits],
    queryFn: async () => {
      try {
        console.log('Buscando movimentações recentes...');
        const allMovements = await movementService.getAllMovements();
        console.log('Total de movimentações:', allMovements.length);
        
        let filteredMovements = allMovements;
        
        if (!filter.showAllUnits && filter.selectedUnitId) {
          filteredMovements = allMovements.filter(m => 
            m.departureUnitId === filter.selectedUnitId || 
            m.arrivalUnitId === filter.selectedUnitId
          );
        }
        
        const sortedMovements = filteredMovements.sort((a, b) => {
          const dateA = new Date(`${a.departureDate}T${a.departureTime}`);
          const dateB = new Date(`${b.departureDate}T${b.departureTime}`);
          return dateB.getTime() - dateA.getTime();
        });
        
        console.log('Movimentações recentes filtradas:', sortedMovements.length);
        return sortedMovements;
      } catch (error) {
        console.error('Erro ao buscar movimentações recentes:', error);
        return [];
      }
    },
    enabled: !!user
  });
  
  // Fetch frequently used vehicles - filtrados por unidade selecionada
  const frequentVehiclesQuery = useQuery({
    queryKey: ['frequent-vehicles', filter.selectedUnitId, filter.showAllUnits],
    queryFn: async () => {
      try {
        console.log('Buscando veículos frequentes...');
        const vehicles = await vehicleService.getAllVehicles();
        const allMovements = await movementService.getAllMovements();
        
        console.log('Veículos totais:', vehicles.length);
        console.log('Movimentações totais:', allMovements.length);
        
        let filteredVehicles = vehicles;
        if (!filter.showAllUnits && filter.selectedUnitId) {
          filteredVehicles = vehicles.filter(v => v.unitId === filter.selectedUnitId);
        }
        
        const vehicleMovementCount = new Map<string, number>();
        
        allMovements.forEach(movement => {
          const vehicleId = movement.vehicleId;
          if (vehicleId) {
            vehicleMovementCount.set(vehicleId, (vehicleMovementCount.get(vehicleId) || 0) + 1);
          }
        });
        
        const result = filteredVehicles
          .map(vehicle => ({
            ...vehicle,
            movementCount: vehicleMovementCount.get(vehicle.id) || 0
          }))
          .sort((a, b) => (b.movementCount || 0) - (a.movementCount || 0));
        
        console.log('Veículos frequentes calculados:', result.length);
        return result;
      } catch (error) {
        console.error('Erro ao buscar veículos frequentes:', error);
        return [];
      }
    },
    enabled: !!user
  });

  return {
    vehicleStats: vehicleStatsQuery.data || { totalVehicles: 0, vehiclesInYard: 0, vehiclesOut: 0 },
    todayMovements: todayMovementsQuery.data || 0,
    recentMovements: recentMovementsQuery.data || [],
    frequentVehicles: frequentVehiclesQuery.data || [],
    refetchMovements: recentMovementsQuery.refetch,
    isLoadingMovements: recentMovementsQuery.isLoading
  };
};
