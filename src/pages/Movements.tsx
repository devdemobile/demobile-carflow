
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Search, Filter, Grid as GridIcon, List } from 'lucide-react';
import { useMobile } from '@/hooks/use-mobile';

const Movements = () => {
  const isMobile = useMobile();
  const [view, setView] = React.useState<'grid' | 'list'>('grid');

  // In a real implementation, these would come from Supabase
  const movements = [
    { 
      id: '1',
      vehiclePlate: 'ABC-1234',
      vehicleName: 'Toyota Corolla Prata',
      driver: 'João Silva',
      destination: 'Cliente XYZ',
      initialMileage: 10000,
      finalMileage: 10150,
      mileageRun: 150,
      departureUnit: 'Matriz',
      departureDate: '2023-06-15',
      departureTime: '08:30',
      arrivalUnit: 'Matriz',
      arrivalDate: '2023-06-15',
      arrivalTime: '17:45',
      duration: '9h 15min',
      status: 'yard'
    },
    { 
      id: '2',
      vehiclePlate: 'DEF-5678',
      vehicleName: 'Honda Civic Branco',
      driver: 'Maria Oliveira',
      destination: 'Fornecedor ABC',
      initialMileage: 15000,
      finalMileage: null,
      mileageRun: null,
      departureUnit: 'Filial 6',
      departureDate: '2023-06-16',
      departureTime: '09:00',
      arrivalUnit: null,
      arrivalDate: null,
      arrivalTime: null,
      duration: null,
      status: 'out'
    }
  ];

  const toggleView = () => {
    setView(prev => prev === 'grid' ? 'list' : 'grid');
  };

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <h1 className="text-3xl font-bold">Movimentações</h1>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                className="pl-8 max-w-[300px]"
                placeholder="Buscar movimentação..." 
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
            {!isMobile && (
              <Button variant="outline" size="icon" onClick={toggleView}>
                {view === 'grid' ? <List className="h-4 w-4" /> : <GridIcon className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </div>

        <div className={`grid ${view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
          {movements.map((movement) => (
            <Card 
              key={movement.id} 
              className={`p-4 cursor-pointer hover:bg-accent/50 ${
                movement.status === 'yard' 
                  ? 'border-l-4 border-l-green-500' 
                  : 'border-l-4 border-l-amber-500'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold">{movement.vehiclePlate}</h3>
                  <p className="text-sm text-muted-foreground">{movement.vehicleName}</p>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  movement.status === 'yard' 
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' 
                    : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100'
                }`}>
                  {movement.status === 'yard' ? 'No Pátio' : 'Fora'}
                </div>
              </div>

              <div className="mt-3 space-y-1">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Motorista:</span>
                  <span className="text-sm">{movement.driver}</span>
                </div>
                {movement.destination && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">Destino:</span>
                    <span className="text-sm">{movement.destination}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-sm font-medium">KM Inicial:</span>
                  <span className="text-sm">{movement.initialMileage} km</span>
                </div>
                {movement.finalMileage && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">KM Final:</span>
                    <span className="text-sm">{movement.finalMileage} km</span>
                  </div>
                )}
                {movement.mileageRun && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium">KM Rodados:</span>
                    <span className="text-sm">{movement.mileageRun} km</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-border">
                <div className="flex justify-between">
                  <div>
                    <span className="text-xs text-muted-foreground block">Saída:</span>
                    <span className="text-sm">{movement.departureUnit} • {new Date(movement.departureDate).toLocaleDateString('pt-BR')} {movement.departureTime}</span>
                  </div>
                  
                  {movement.arrivalUnit && (
                    <div className="text-right">
                      <span className="text-xs text-muted-foreground block">Entrada:</span>
                      <span className="text-sm">{movement.arrivalUnit} • {new Date(movement.arrivalDate!).toLocaleDateString('pt-BR')} {movement.arrivalTime}</span>
                    </div>
                  )}
                </div>
                {movement.duration && (
                  <div className="flex justify-end mt-1">
                    <span className="text-xs text-muted-foreground">Duração: {movement.duration}</span>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Movements;
