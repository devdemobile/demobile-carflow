
import React from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Map, Users, Car } from 'lucide-react';
import { useUnits } from '@/hooks/useUnits';
import { UnitSkeleton } from '@/components/units/UnitSkeleton';
import { toast } from 'sonner';

const Units = () => {
  const { units, searchTerm, setSearchTerm, isLoading } = useUnits();

  const handleCreateUnit = () => {
    toast.info("Funcionalidade em desenvolvimento");
  };

  const handleEditUnit = () => {
    toast.info("Funcionalidade em desenvolvimento");
  };

  const handleViewDetails = () => {
    toast.info("Funcionalidade em desenvolvimento");
  };

  return (
    <Layout>
      <div className="container mx-auto py-6 pb-16 md:pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <h1 className="text-3xl font-bold">Unidades</h1>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                className="pl-8 max-w-[300px]"
                placeholder="Buscar unidade..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button onClick={handleCreateUnit}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Unidade
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {isLoading ? (
            // Show loading skeletons while data is loading
            Array.from({ length: 4 }).map((_, index) => (
              <UnitSkeleton key={`skeleton-${index}`} />
            ))
          ) : units.length > 0 ? (
            units.map((unit) => (
              <Card key={unit.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{unit.name}</span>
                    <span className="text-sm bg-muted px-2 py-1 rounded">{unit.code}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start">
                    <Map className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                    <span className="text-sm">{unit.address || 'Endereço não cadastrado'}</span>
                  </div>
                  <div className="flex space-x-4">
                    <div className="flex items-center">
                      <Car className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">{unit.vehicleCount} veículos</span>
                    </div>
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                      <span className="text-sm">{unit.usersCount} usuários</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end space-x-2 pt-0">
                  <Button variant="outline" size="sm" onClick={handleEditUnit}>
                    Editar
                  </Button>
                  <Button size="sm" onClick={handleViewDetails}>
                    Detalhes
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <p className="text-muted-foreground">Nenhuma unidade encontrada</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Units;
