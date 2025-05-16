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
import { frequentVehicles, getVehicleStats, mockVehicles, getVehicleByPlate } from '@/services/mockData';
import { Vehicle, Movement } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { Search } from 'lucide-react';
import { movementService } from '@/services/movements/movementService';
import { useQuery } from '@tanstack/react-query';

const Dashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [plateSearch, setPlateSearch] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  const stats = getVehicleStats(user?.unitId);
  
  // Buscar movimentações recentes do banco de dados
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
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!plateSearch.trim()) {
      toast({
        title: "Campo vazio",
        description: "Por favor, digite uma placa para pesquisar.",
        variant: "destructive",
      });
      return;
    }
    
    const vehicle = getVehicleByPlate(plateSearch);
    
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
  
  // Encontrar a última movimentação para o veículo selecionado
  const getLastMovement = async (): Promise<Movement | undefined> => {
    if (!selectedVehicle) return undefined;
    
    try {
      const movements = await movementService.getMovementsByVehicle(selectedVehicle.id);
      
      // Retornar a movimentação de saída mais recente
      return movements
        .filter(m => m.type === 'exit')
        .sort((a, b) => {
          const dateA = new Date(`${a.departureDate}T${a.departureTime}`);
          const dateB = new Date(`${b.departureDate}T${b.departureTime}`);
          return dateB.getTime() - dateA.getTime();
        })[0];
    } catch (error) {
      console.error('Erro ao buscar movimentações do veículo:', error);
      return undefined;
    }
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
          <StatCard title="Total de Veículos" value={stats.totalVehicles} />
          <StatCard 
            title="Veículos no Pátio" 
            value={stats.vehiclesInYard} 
            description={`${((stats.vehiclesInYard / stats.totalVehicles) * 100).toFixed(0)}% da frota`}
          />
          <StatCard 
            title="Veículos Fora" 
            value={stats.vehiclesOut}
            description={`${((stats.vehiclesOut / stats.totalVehicles) * 100).toFixed(0)}% da frota`}
          />
          <StatCard title="Movimentações Hoje" value={stats.movementsToday} />
        </div>
        
        {/* Frequent Vehicles */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Veículos Frequentes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {frequentVehicles.slice(0, 4).map((vehicle) => (
              <VehicleCard 
                key={vehicle.id} 
                vehicle={vehicle} 
                onClick={() => handleVehicleClick(vehicle)}
              />
            ))}
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
