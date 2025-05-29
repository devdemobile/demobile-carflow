
import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/layout/Layout';
import VehicleMovementForm from '@/components/dashboard/VehicleMovementForm';
import MovementEditDialog from '@/components/movements/MovementEditDialog';
import FrequentVehiclesSection from '@/components/dashboard/sections/FrequentVehiclesSection';
import RecentMovementsSection from '@/components/dashboard/sections/RecentMovementsSection';
import DashboardStats from '@/components/dashboard/DashboardStats';
import DashboardSearchForm from '@/components/dashboard/DashboardSearchForm';
import { useDashboardQueries } from '@/components/dashboard/DashboardQueries';
import { Vehicle, Movement } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { movementService } from '@/services/movements/movementService';
import { vehicleService } from '@/services/vehicles/vehicleService';
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

  const {
    vehicleStats,
    todayMovements,
    recentMovements,
    frequentVehicles,
    refetchMovements,
    isLoadingMovements
  } = useDashboardQueries(user, filter);
  
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
      console.log('Buscando veículo pela placa:', plateSearch);
      const vehicle = await vehicleService.getVehicleByPlate(plateSearch);
      
      if (vehicle) {
        console.log('Veículo encontrado:', vehicle);
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
        console.log('Veículo não encontrado');
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

  return (
    <Layout>
      <div className="container py-6 pb-20 md:pb-6 space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-xl font-bold">
            Bem-Vindo ao CarFlow, {user?.name?.split(' ')[0]}!
          </h1>
          
          <DashboardStats
            vehicleStats={vehicleStats}
            todayMovements={todayMovements}
            unitFilter={filter}
            isMobile={isMobile}
          />
        </div>
        
        <DashboardSearchForm
          plateSearch={plateSearch}
          setPlateSearch={setPlateSearch}
          onSubmit={handleSearchSubmit}
          unitFilter={filter}
          isMobile={isMobile}
        />
        
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
