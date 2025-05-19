import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Layout from '@/components/layout/Layout';
import StatCard from '@/components/dashboard/StatCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import VehicleCard from '@/components/vehicles/VehicleCard';
import MovementCard from '@/components/movements/MovementCard';
import VehicleMovementForm from '@/components/dashboard/VehicleMovementForm';
import MovementEditDialog from '@/components/movements/MovementEditDialog';
import { Vehicle, Movement } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Search, ChevronRight, ChevronLeft } from 'lucide-react';
import { movementService } from '@/services/movements/movementService';
import { vehicleService } from '@/services/vehicles/vehicleService';
import { useQuery } from '@tanstack/react-query';
import { useIsMobile } from '@/hooks/use-mobile';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  const [plateSearch, setPlateSearch] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMovement, setSelectedMovement] = useState<Movement | null>(null);
  const [isMovementDialogOpen, setIsMovementDialogOpen] = useState(false);

  // Estados para controlar a exibição de "Mostrar Mais"
  const [showAllVehicles, setShowAllVehicles] = useState(false);
  const [showAllMovements, setShowAllMovements] = useState(false);
  
  // Fetch vehicle stats
  const { data: vehicleStats = { totalVehicles: 0, vehiclesInYard: 0, vehiclesOut: 0 }, isLoading: isLoadingStats } = useQuery({
    queryKey: ['vehicle-stats'],
    queryFn: async () => {
      try {
        const allVehicles = await vehicleService.getAllVehicles();
        const totalVehicles = allVehicles.length;
        
        const vehiclesInYard = allVehicles.filter(v => v.location === 'yard').length;
        const vehiclesOut = allVehicles.filter(v => v.location === 'out').length;
        
        return {
          totalVehicles,
          vehiclesInYard,
          vehiclesOut
        };
      } catch (error) {
        console.error('Erro ao buscar estatísticas de veículos:', error);
        return {
          totalVehicles: 0,
          vehiclesInYard: 0,
          vehiclesOut: 0
        };
      }
    }
  });
  
  // Fetch today's movements
  const { data: todayMovements = 0 } = useQuery({
    queryKey: ['today-movements-count'],
    queryFn: async () => {
      try {
        const allMovements = await movementService.getAllMovements();
        
        // Filter today's movements
        const today = new Date().toISOString().split('T')[0]; // Format YYYY-MM-DD
        return allMovements.filter(m => m.departureDate === today).length;
      } catch (error) {
        console.error('Erro ao buscar movimentações de hoje:', error);
        return 0;
      }
    }
  });
  
  // Fetch recent movements
  const { data: recentMovements = [], refetch: refetchMovements, isLoading: isLoadingMovements } = useQuery({
    queryKey: ['recent-movements'],
    queryFn: async () => {
      try {
        const allMovements = await movementService.getAllMovements();
        // Sort by most recent departure date
        return allMovements
          .sort((a, b) => {
            const dateA = new Date(`${a.departureDate}T${a.departureTime}`);
            const dateB = new Date(`${b.departureDate}T${b.departureTime}`);
            return dateB.getTime() - dateA.getTime();
          });
      } catch (error) {
        console.error('Erro ao buscar movimentações recentes:', error);
        return [];
      }
    }
  });
  
  // Fetch frequently used vehicles
  const { data: frequentVehicles = [] } = useQuery({
    queryKey: ['frequent-vehicles'],
    queryFn: async () => {
      try {
        const vehicles = await vehicleService.getAllVehicles();
        const allMovements = await movementService.getAllMovements();
        
        // Count movements per vehicle
        const vehicleMovementCount = new Map<string, number>();
        
        allMovements.forEach(movement => {
          const vehicleId = movement.vehicleId;
          if (vehicleId) {
            vehicleMovementCount.set(
              vehicleId,
              (vehicleMovementCount.get(vehicleId) || 0) + 1
            );
          }
        });
        
        // Add movement count to vehicles and sort
        return vehicles
          .map(vehicle => ({
            ...vehicle,
            movementCount: vehicleMovementCount.get(vehicle.id) || 0
          }))
          .sort((a, b) => (b.movementCount || 0) - (a.movementCount || 0));
      } catch (error) {
        console.error('Erro ao buscar veículos frequentes:', error);
        return [];
      }
    }
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
      // Search for vehicle by plate using the service
      const vehicle = await vehicleService.getVehicleByPlate(plateSearch);
      
      if (vehicle) {
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
  
  // Corrigido para aceitar apenas um parâmetro
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
  
  const handleMovementSubmit = async (formData: Movement) => {
    try {
      // Save movement to the service
      await movementService.createMovement(formData);

      // Update the vehicle's status to match the movement type
      if (selectedVehicle) {
        await vehicleService.updateVehicle(selectedVehicle.id, {
          location: formData.type === 'exit' ? 'out' : 'yard',
          mileage: formData.initialMileage // Update vehicle mileage
        });
      }
      
      // Update recent movements after registration
      refetchMovements();
      
      toast({
        title: formData.type === 'exit' ? "Saída registrada" : "Entrada registrada",
        description: `A ${formData.type === 'exit' ? 'saída' : 'entrada'} do veículo foi registrada com sucesso.`,
      });
      
      // Clear form after submission
      setPlateSearch('');
      setSelectedVehicle(null);
      setIsFormOpen(false);
    } catch (error) {
      console.error("Erro ao registrar movimentação:", error);
      toast({
        title: "Erro ao registrar movimentação",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao registrar a movimentação.",
        variant: "destructive",
      });
    }
  };

  // Cálculo das porcentagens
  const inYardPercentage = vehicleStats.totalVehicles > 0 
    ? Math.round((vehicleStats.vehiclesInYard / vehicleStats.totalVehicles) * 100) 
    : 0;
    
  const outPercentage = vehicleStats.totalVehicles > 0 
    ? Math.round((vehicleStats.vehiclesOut / vehicleStats.totalVehicles) * 100) 
    : 0;

  // Create header stats with percentages and tamanho fixo para as DIVs
  const headerStats = !isMobile ? [
    {
      title: "Total de Veículos",
      value: vehicleStats.totalVehicles
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

  // Preparar exibição de veículos frequentes
  const displayFrequentVehicles = showAllVehicles 
    ? frequentVehicles 
    : frequentVehicles.slice(0, 4);

  // Preparar exibição de movimentações recentes
  const displayRecentMovements = showAllMovements 
    ? recentMovements 
    : recentMovements.slice(0, 4);

  // Verificar se há mais itens além dos exibidos inicialmente
  const hasMoreVehicles = frequentVehicles.length > 4;
  const hasMoreMovements = recentMovements.length > 4;

  return (
    <Layout>
      <div className="container py-6 pb-20 md:pb-6 space-y-6 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-xl font-bold">
            Bem-Vindo {user?.name?.split(' ')[0]}!
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
        
        {/* Vehicle Search */}
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
            <p className="text-xs text-muted-foreground mt-1">Digite a placa do veículo</p>
          </form>
        </div>
        
        {/* Frequent Vehicles - Implementação do carousel e mostrar mais */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Veículos Frequentes</h2>
          
          {!showAllVehicles && !isMobile && frequentVehicles.length > 4 ? (
            <Carousel className="w-full mx-auto" opts={{ 
              align: 'start', 
              containScroll: 'trimSnaps',
              dragFree: false,
              slidesToScroll: 1
            }}>
              <CarouselContent>
                {frequentVehicles.slice(0, 8).map((vehicle) => (
                  <CarouselItem key={vehicle.id} className="md:basis-1/4 px-1">
                    <VehicleCard 
                      vehicle={vehicle} 
                      onClick={() => handleVehicleClick(vehicle)}
                      compact={true}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="!-left-4" />
              <CarouselNext className="!-right-4" />
            </Carousel>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {displayFrequentVehicles.length > 0 ? (
                displayFrequentVehicles.map((vehicle) => (
                  <VehicleCard 
                    key={vehicle.id} 
                    vehicle={vehicle} 
                    onClick={() => handleVehicleClick(vehicle)}
                    compact={true}
                  />
                ))
              ) : (
                <p className="text-muted-foreground text-center py-6 col-span-4">
                  Nenhum veículo cadastrado ainda.
                </p>
              )}
            </div>
          )}
          
          {/* Botão "Mostrar Mais" para veículos */}
          {hasMoreVehicles && (
            <div className="flex justify-center mt-3">
              <Button 
                variant="outline"
                onClick={() => setShowAllVehicles(!showAllVehicles)}
                className="text-sm"
              >
                {showAllVehicles ? "- Mostrar Menos" : "+ Mostrar Mais"}
              </Button>
            </div>
          )}
        </div>
        
        {/* Recent Movements - Implementação do carousel e mostrar mais */}
        <div>
          <h2 className="text-lg font-semibold mb-2">Movimentações Recentes</h2>
          
          {isLoadingMovements ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="border rounded-lg shadow-sm p-4">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : recentMovements.length === 0 ? (
            <div className="border rounded-lg shadow-sm p-4 col-span-full bg-muted text-center">
              Nenhuma movimentação registrada nos últimos dias.
            </div>
          ) : !showAllMovements && !isMobile && recentMovements.length > 4 ? (
            <Carousel className="w-full mx-auto" opts={{ 
              align: 'start', 
              containScroll: 'trimSnaps',
              dragFree: false,
              slidesToScroll: 1
            }}>
              <CarouselContent>
                {recentMovements.slice(0, 8).map((movement) => (
                  <CarouselItem key={movement.id} className="md:basis-1/2 lg:basis-1/3 px-1">
                    <MovementCard 
                      movement={movement} 
                      onClick={handleMovementClick}
                    />
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="!-left-4" />
              <CarouselNext className="!-right-4" />
            </Carousel>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {displayRecentMovements.map((movement) => (
                <MovementCard 
                  key={movement.id} 
                  movement={movement} 
                  onClick={handleMovementClick}
                />
              ))}
            </div>
          )}
          
          {/* Botão "Mostrar Mais" para movimentações */}
          {hasMoreMovements && (
            <div className="flex justify-center mt-3">
              <Button 
                variant="outline"
                onClick={() => setShowAllMovements(!showAllMovements)}
                className="text-sm"
              >
                {showAllMovements ? "- Mostrar Menos" : "+ Mostrar Mais"}
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Vehicle Movement Form Dialog */}
      {selectedVehicle && (
        <VehicleMovementForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          vehicle={selectedVehicle}
          onSubmit={handleMovementSubmit}
        />
      )}

      {/* Movement Details Dialog */}
      <MovementEditDialog 
        isOpen={isMovementDialogOpen}
        onClose={() => setIsMovementDialogOpen(false)}
        movement={selectedMovement}
        onUpdate={handleMovementUpdate}
        onDelete={handleMovementDelete}
        showUnits={true}
      />
    </Layout>
  );
};

export default Dashboard;
