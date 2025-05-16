
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, List, Grid as GridIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useMobile } from '@/hooks/use-mobile';

const Vehicles = () => {
  const isMobile = useMobile();
  const [view, setView] = React.useState<'grid' | 'list'>('grid');

  // In a real implementation, these would come from Supabase
  const vehicles = [
    { id: '1', plate: 'ABC-1234', make: 'Toyota', model: 'Corolla', year: 2022, color: 'Prata', mileage: 10000, location: 'yard' },
    { id: '2', plate: 'DEF-5678', make: 'Honda', model: 'Civic', year: 2021, color: 'Branco', mileage: 15000, location: 'out' },
    { id: '3', plate: 'GHI-9012', make: 'Volkswagen', model: 'Golf', year: 2023, color: 'Preto', mileage: 8000, location: 'yard' },
  ];

  const toggleView = () => {
    setView(prev => prev === 'grid' ? 'list' : 'grid');
  };

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <h1 className="text-3xl font-bold">Veículos</h1>
          <div className="flex items-center gap-2">
            <Input 
              className="max-w-[300px]" 
              placeholder="Buscar veículo..." 
            />
            {!isMobile && (
              <Button variant="outline" size="icon" onClick={toggleView}>
                {view === 'grid' ? <List className="h-4 w-4" /> : <GridIcon className="h-4 w-4" />}
              </Button>
            )}
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Novo Veículo
            </Button>
          </div>
        </div>

        <div className={`grid ${view === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-6`}>
          {vehicles.map((vehicle) => (
            <Card key={vehicle.id} className={`overflow-hidden ${
              vehicle.location === 'yard' 
                ? 'border-l-4 border-l-green-500' 
                : 'border-l-4 border-l-amber-500'
            }`}>
              {view === 'grid' ? (
                <>
                  <div className="relative h-40 bg-muted">
                    <div className="absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium bg-background/80">
                      {vehicle.location === 'yard' ? 'No Pátio' : 'Fora'}
                    </div>
                    <div className="h-full flex items-center justify-center">
                      <span className="text-muted-foreground">Foto do Veículo</span>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="text-lg font-bold">{vehicle.plate}</h3>
                    <p className="text-sm text-muted-foreground">
                      {vehicle.make} {vehicle.model} {vehicle.color} {vehicle.year}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-sm">KM: {vehicle.mileage} km</span>
                      <Button variant="ghost" size="sm">Detalhes</Button>
                    </div>
                  </CardContent>
                </>
              ) : (
                <div className="flex p-4">
                  <div className="mr-4 h-16 w-16 bg-muted rounded flex items-center justify-center">
                    <span className="text-xs text-muted-foreground">Foto</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold">{vehicle.plate}</h3>
                    <p className="text-sm text-muted-foreground">
                      {vehicle.make} {vehicle.model} {vehicle.color} {vehicle.year}
                    </p>
                  </div>
                  <div className="flex flex-col items-end justify-between">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      vehicle.location === 'yard' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100' 
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100'
                    }`}>
                      {vehicle.location === 'yard' ? 'No Pátio' : 'Fora'}
                    </span>
                    <span className="text-sm mt-auto">KM: {vehicle.mileage}</span>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Vehicles;
