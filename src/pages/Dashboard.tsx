import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import VehicleMovementForm from '@/components/dashboard/VehicleMovementForm';
import MovementEditDialog from '@/components/movements/MovementEditDialog';
import UnitFilter from '@/components/filters/UnitFilter';
import FrequentVehiclesSection from '@/components/dashboard/sections/FrequentVehiclesSection';
import RecentMovementsSection from '@/components/dashboard/sections/RecentMovementsSection';
import { Vehicle, Movement } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Search } from 'lucide-react';
import { movementService } from '@/services/movements/movementService';
import { vehicleService } from '@/services/vehicles/vehicleService';
import { useQuery } from '@tanstack/react-query';
import { useIsMobile } from '@/hooks/use-mobile';
import { useUnitFilter } from '@/hooks/useUnitFilter';

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const { filter, setShowAllUnits, setSelectedUnit, canEditInUnit } = useUnitFilter();
  
  const [plateSearch, setPlateSearch] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState<Movement | null>(null);
  const [isMovementDialogOpen, setIsMovementDialogOpen] = useState(false);

  // Fetch vehicle stats - filtrados por unidade selecionada
  const { data: vehicleStats = { totalVehicles: 0, vehiclesInYard: 0, vehiclesOut: 0 } } = useQuery({
    queryKey: ['vehicle-stats', filter.selectedUnitId, filter.showAllUnits],
    queryFn: async () => {
      try {
        const allVehicles = await vehicleService.getAllVehicles();
        
        let filteredVehicles = allVehicles;
        if (!filter.showAllUnits && filter.selectedUnitId) {
          filteredVehicles = allVehicles.filter(v => v.unitId === filter.selectedUnitId);
        }
        
        const totalVehicles = filteredVehicles.length;
        const vehiclesInYard = filteredVehicles.filter(v => v.location === 'yard').length;
        const vehiclesOut = filteredVehicles.filter(v => v.location === 'out').length;
        
        return { totalVehicles, vehiclesInYard, vehiclesOut };
      } catch (error) {
        console.error('Erro ao buscar estatísticas de veículos:', error);
        return { totalVehicles: 0, vehiclesInYard: 0, vehiclesOut: 0 };
      }
    },
    enabled: !!user
  });
  
  // Fetch today's movements - filtradas por unidade selecionada
  const { data: todayMovements = 0 } = useQuery({
    queryKey: ['today-movements-count', filter.selectedUnitId, filter.showAllUnits],
    queryFn: async () => {
      try {
        const allMovements = await movementService.getAllMovements();
        const today = new Date().toISOString().split('T')[0];
        let filteredMovements = allMovements.filter(m => m.departureDate === today);
        
        if (!filter.showAllUnits && filter.selectedUnitId) {
          filteredMovements = filteredMovements.filter(m => 
            m.departureUnitId === filter.selectedUnitId || 
            m.arrivalUnitId === filter.selectedUnitId
          );
        }
        
        return filteredMovements.length;
      } catch (error) {
        console.error('Erro ao buscar movimentações de hoje:', error);
        return 0;
      }
    },
    enabled: !!user
  });
  
  // Fetch recent movements - filtradas por unidade selecionada
  const { data: recentMovements = [], refetch: refetchMovements, isLoading: isLoadingMovements } = useQuery({
    queryKey: ['recent-movements', filter.selectedUnitId, filter.showAllUnits],
    queryFn: async () => {
      try {
        const allMovements = await movementService.getAllMovements();
        let filteredMovements = allMovements;
        
        if (!filter.showAllUnits && filter.selectedUnitId) {
          filteredMovements = allMovements.filter(m => 
            m.departureUnitId === filter.selectedUnitId || 
            m.arrivalUnitId === filter.selectedUnitId
          );
        }
        
        return filteredMovements.sort((a, b) => {
          const dateA = new Date(`${a.departureDate}T${a.departureTime}`);
          const dateB = new Date(`${b.departureDate}T${b.departureTime}`);
          return dateB.getTime() - dateA.getTime();
        });
      } catch (error) {
        console.error('Erro ao buscar movimentações recentes:', error);
        return [];
      }
    },
    enabled: !!user
  });
  
  // Fetch frequently used vehicles - filtrados por unidade selecionada
  const { data: frequentVehicles = [] } = useQuery({
    queryKey: ['frequent-vehicles', filter.selectedUnitId, filter.showAllUnits],
    queryFn: async () => {
      try {
        const vehicles = await vehicleService.getAllVehicles();
        const allMovements = await movementService.getAllMovements();
        
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
        
        return filteredVehicles
          .map(vehicle => ({
            ...vehicle,
            movementCount: vehicleMovementCount.get(vehicle.id) || 0
          }))
          .sort((a, b) => (b.movementCount || 0) - (a.movementCount || 0));
      } catch (error) {
        console.error('Erro ao buscar veículos frequentes:', error);
        return [];
      }
    },
    enabled: !!user
  });
  
  // Search for vehicle by plate
  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!plateSearch.trim()) {
      toast({
        title: "Campo vazio",
        description: "Por favor, digite uma placa para pesquisar.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const vehicle = await vehicleService.getVehicleByPlate(plateSearch);
      
      if (vehicle) {
        if (!canEditInUnit(vehicle.unitId)) {
          toast({
            title: "Acesso restrito",
            description: "Você pode visualizar este veículo, mas não pode registrar movimentações para ele.",
            variant: "destructive",
          });
          return;
        }
        
        setSelectedVehicle(vehicle);
        setIsFormOpen(true);
      } else {
        toast({
          title: "Veículo não encontrado",
          description: "Não encontramos um veículo com essa placa.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao buscar veículo:", error);
      toast({
        title: "Erro ao buscar veículo",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao buscar o veículo.",
        variant: "destructive",
      });
    }
  };
  
  const handleVehicleClick = (vehicle: Vehicle) => {
    if (!canEditInUnit(vehicle.unitId)) {
      toast({
        title: "Acesso restrito",
        description: "Você pode visualizar este veículo, mas não pode registrar movimentações para ele.",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedVehicle(vehicle);
    setIsFormOpen(true);
  };
  
  const handleMovementClick = (movement: Movement) => {
    setSelectedMovement(movement);
    setIsMovementDialogOpen(true);
  };
  
  const handleMovementUpdate = async (updatedMovement: Movement): Promise<void> => {
    try {
      await movementService.updateMovement(updatedMovement.id, updatedMovement);
      refetchMovements();
      toast({
        title: "Movimentação atualizada",
        description: "A movimentação foi atualizada com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao atualizar movimentação:", error);
      toast({
        title: "Erro ao atualizar",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao atualizar a movimentação.",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  const handleMovementDelete = async (movement: Movement): Promise<void> => {
    try {
      await movementService.deleteMovement(movement.id);
      refetchMovements();
      toast({
        title: "Movimentação excluída",
        description: "A movimentação foi excluída com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao excluir movimentação:", error);
      toast({
        title: "Erro ao excluir",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao excluir a movimentação.",
        variant: "destructive",
      });
      throw error;
    }
  };
  
  const handleMovementFormSuccess = async (success: boolean) => {
    if (success) {
      refetchMovements();
      setPlateSearch('');
      setSelectedVehicle(null);
      setIsFormOpen(false);
    }
  };

  // Cálculo das porcentagens
  const inYardPercentage = vehicleStats.totalVehicles > 0 
    ? Math.round((vehicleStats.vehiclesInYard / vehicleStats.totalVehicles) * 100) 
    : 0;
    
  const outPercentage = vehicleStats.totalVehicles > 0 
    ? Math.round((vehicleStats.vehiclesOut / vehicleStats.totalVehicles) * 100) 
    : 0;

  // Create header stats with percentages
  const headerStats = !isMobile ? [
    {
      title: "Total de Veículos",
      value: vehicleStats.totalVehicles,
      description: filter.showAllUnits ? "Em todas as unidades" : `Na unidade filtrada`
    },
    {
      title: "Veículos no Pátio",
      value: vehicleStats.vehiclesInYard,
      description: `${inYardPercentage}% da frota`
    },
    {
      title: "Veículos Fora",
      value: vehicleStats.vehiclesOut,
      description: `${outPercentage}% da frota`
    },
    {
      title: "Movimentados Hoje",
      value: todayMovements
    }
  ] : [];

  return (
    <Layout>
      <div className="container py-6 pb-20 md:pb-6 space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-xl font-bold">
            Bem-Vindo ao CarFlow, {user?.name?.split(' ')[0]}!
          </h1>
          
          {!isMobile && (
            <div className="flex gap-3 items-center">
              {headerStats.map((stat, index) => (
                <div key={index} className="bg-card border rounded-md px-4 py-2 flex flex-col w-[150px] h-[80px]">
                  <span className="text-xs text-muted-foreground mb-0.5">{stat.title}</span>
                  <span className="font-medium text-base">{stat.value}</span>
                  {stat.description && (
                    <span className="text-xs text-muted-foreground">{stat.description}</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {(user?.role === 'admin' || user?.permissions?.canViewUnits) && (
          <div className="bg-card border rounded-lg p-4">
            <UnitFilter
              selectedUnitId={filter.selectedUnitId}
              showAllUnits={filter.showAllUnits}
              onUnitChange={setSelectedUnit}
              onShowAllChange={setShowAllUnits}
            />
          </div>
        )}
        
        <div className="bg-card border rounded-lg p-4">
          <form onSubmit={handleSearchSubmit} className="space-y-3">
            <Label htmlFor="plate-search">Registrar Movimentação</Label>
            <div className="flex w-full items-center space-x-2">
              <Input
                id="plate-search"
                placeholder="BRA2E25"
                value={plateSearch}
                onChange={(e) => setPlateSearch(e.target.value.toUpperCase())}
                className="uppercase"
              />
              <Button type="submit" className="shrink-0" size={isMobile ? "icon" : "default"}>
                <Search className="h-4 w-4" />
                {!isMobile && "Registrar"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Digite a placa do veículo
              {!filter.showAllUnits && filter.selectedUnitId && 
                ` (apenas veículos da sua unidade podem ser movimentados)`
              }
            </p>
          </form>
        </div>
        
        <FrequentVehiclesSection
          vehicles={frequentVehicles}
          globalFilter={filter}
          onVehicleClick={handleVehicleClick}
          isMobile={isMobile}
        />
        
        <RecentMovementsSection
          movements={recentMovements}
          globalFilter={filter}
          onMovementClick={handleMovementClick}
          isMobile={isMobile}
          isLoading={isLoadingMovements}
        />
      </div>
      
      {selectedVehicle && (
        <VehicleMovementForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          vehicle={selectedVehicle}
          onSubmit={handleMovementFormSuccess}
        />
      )}

      <MovementEditDialog 
        isOpen={isMovementDialogOpen}
        onClose={() => setIsMovementDialogOpen(false)}
        movement={selectedMovement}
        onUpdate={handleMovementUpdate}
        onDelete={handleMovementDelete}
        showUnits={true}
        onSaved={refetchMovements}
      />
    </Layout>
  );
};

export default Dashboard;
