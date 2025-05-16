
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
import { Vehicle, Movement } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Search, Car, PackageCheck, Warehouse, Calendar } from 'lucide-react';
import { movementService } from '@/services/movements/movementService';
import { vehicleService } from '@/services/vehicles/vehicleService';
import { useQuery } from '@tanstack/react-query';

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [plateSearch, setPlateSearch] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Buscar estatísticas de veículos
  const { data: vehicleStats = { totalVehicles: 0, vehiclesInYard: 0, vehiclesOut: 0 } } = useQuery({
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
  
  // Buscar movimentações de hoje
  const { data: todayMovements = 0 } = useQuery({
    queryKey: ['today-movements-count'],
    queryFn: async () => {
      try {
        const allMovements = await movementService.getAllMovements();
        
        // Filtra movimentações de hoje
        const today = new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
        return allMovements.filter(m => m.departureDate === today).length;
      } catch (error) {
        console.error('Erro ao buscar movimentações de hoje:', error);
        return 0;
      }
    }
  });
  
  // Buscar movimentações recentes
  const { data: recentMovements = [], refetch: refetchMovements } = useQuery({
    queryKey: ['recent-movements'],
    queryFn: async () => {
      try {
        const allMovements = await movementService.getAllMovements();
        // Ordenar por data de partida mais recente
        return allMovements
          .sort((a, b) => {
            const dateA = new Date(`${a.departureDate}T${a.departureTime}`);
            const dateB = new Date(`${b.departureDate}T${b.departureTime}`);
            return dateB.getTime() - dateA.getTime();
          })
          .slice(0, 4); // Limitar aos 4 mais recentes
      } catch (error) {
        console.error('Erro ao buscar movimentações recentes:', error);
        return [];
      }
    }
  });
  
  // Buscar veículos mais frequentemente utilizados
  const { data: frequentVehicles = [] } = useQuery({
    queryKey: ['frequent-vehicles'],
    queryFn: async () => {
      try {
        const vehicles = await vehicleService.getAllVehicles();
        const allMovements = await movementService.getAllMovements();
        
        // Contar quantas movimentações cada veículo tem
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
        
        // Adicionar contagem de movimentações aos veículos e ordenar
        return vehicles
          .map(vehicle => ({
            ...vehicle,
            movementCount: vehicleMovementCount.get(vehicle.id) || 0
          }))
          .sort((a, b) => (b.movementCount || 0) - (a.movementCount || 0))
          .slice(0, 4); // Pegar os 4 mais frequentes
      } catch (error) {
        console.error('Erro ao buscar veículos frequentes:', error);
        return [];
      }
    }
  });
  
  // Buscar veículo pelo número da placa
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
      // Buscar veículo pelo número da placa usando o serviço real
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
  
  const handleMovementSubmit = (formData: Movement) => {
    // Atualizar movimentações recentes após o registro
    refetchMovements();
    
    // Limpar formulário após submissão
    setPlateSearch('');
    setSelectedVehicle(null);
  };

  return (
    <Layout>
      <div className="container py-6 pb-20 md:pb-6 space-y-6 animate-fade-in">
        <h1 className="text-2xl font-bold">
          Olá, {user?.name?.split(' ')[0]}! <span className="text-muted-foreground font-normal">Bem-vindo ao CarFlow</span>
        </h1>
        
        {/* Vehicle Search */}
        <div className="bg-card border rounded-lg p-4">
          <form onSubmit={handleSearchSubmit} className="space-y-3">
            <Label htmlFor="plate-search">Registrar Movimentação</Label>
            <div className="flex w-full items-center space-x-2">
              <Input
                id="plate-search"
                placeholder="Digite a placa do veículo"
                value={plateSearch}
                onChange={(e) => setPlateSearch(e.target.value.toUpperCase())}
                className="uppercase"
              />
              <Button type="submit" className="shrink-0">
                <Search className="h-4 w-4 mr-2" />
                Pesquisar
              </Button>
            </div>
          </form>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard 
            title="Total de Veículos" 
            value={vehicleStats.totalVehicles} 
            icon={<Car />}
          />
          <StatCard 
            title="Veículos no Pátio" 
            value={vehicleStats.vehiclesInYard} 
            description={vehicleStats.totalVehicles > 0 ? 
              `${((vehicleStats.vehiclesInYard / vehicleStats.totalVehicles) * 100).toFixed(0)}% da frota` : 
              '0% da frota'
            }
            icon={<Warehouse />}
          />
          <StatCard 
            title="Veículos Fora" 
            value={vehicleStats.vehiclesOut}
            description={vehicleStats.totalVehicles > 0 ? 
              `${((vehicleStats.vehiclesOut / vehicleStats.totalVehicles) * 100).toFixed(0)}% da frota` : 
              '0% da frota'
            }
            icon={<PackageCheck />}
          />
          <StatCard 
            title="Movimentações Hoje" 
            value={todayMovements}
            icon={<Calendar />}
          />
        </div>
        
        {/* Frequent Vehicles */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Veículos Frequentes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {frequentVehicles.length > 0 ? (
              frequentVehicles.map((vehicle) => (
                <VehicleCard 
                  key={vehicle.id} 
                  vehicle={vehicle} 
                  onClick={() => handleVehicleClick(vehicle)}
                />
              ))
            ) : (
              <p className="text-muted-foreground text-center py-8 col-span-4">
                Nenhum veículo cadastrado ainda.
              </p>
            )}
          </div>
        </div>
        
        {/* Recent Movements */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Movimentações Recentes</h2>
          {recentMovements.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {recentMovements.map((movement) => (
                <MovementCard key={movement.id} movement={movement} />
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-8">
              Nenhuma movimentação registrada nas últimas 24 horas.
            </p>
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
          lastMovement={undefined}
        />
      )}
    </Layout>
  );
};

export default Dashboard;
