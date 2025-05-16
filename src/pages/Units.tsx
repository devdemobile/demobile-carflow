
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Map, Users, Car } from 'lucide-react';

const Units = () => {
  // In a real implementation, these would come from Supabase
  const units = [
    { 
      id: '1',
      name: 'Matriz',
      code: 'MTZ',
      address: 'Av. Principal, 1000, Centro, São Paulo - SP',
      vehicleCount: 15,
      usersCount: 8
    },
    { 
      id: '2',
      name: 'Filial 6',
      code: 'FL6',
      address: 'Rua Secundária, 500, Jardim Europa, São Paulo - SP',
      vehicleCount: 10,
      usersCount: 5
    }
  ];

  return (
    <Layout>
      <div className="container mx-auto py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <h1 className="text-3xl font-bold">Unidades</h1>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                className="pl-8 max-w-[300px]"
                placeholder="Buscar unidade..." 
              />
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nova Unidade
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {units.map((unit) => (
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
                  <span className="text-sm">{unit.address}</span>
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
                <Button variant="outline" size="sm">Editar</Button>
                <Button size="sm">Detalhes</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Units;
