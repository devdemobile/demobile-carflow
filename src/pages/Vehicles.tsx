
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import { useVehicles } from '@/hooks/useVehicles';
import VehiclesTable from '@/components/vehicles/VehiclesTable';
import VehiclesFilter from '@/components/vehicles/VehiclesFilter';
import VehicleCard from '@/components/vehicles/VehicleCard';
import { useMediaQuery } from '@/hooks/use-mobile';

const Vehicles = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUnit, setFilterUnit] = useState<string | null>(null);
  const [filterLocation, setFilterLocation] = useState<string | null>(null);
  
  const { 
    vehicles, 
    isLoading, 
    refetch,
    viewMode, 
    setViewMode, 
    filters, 
    handleFilterChange, 
    resetFilters 
  } = useVehicles();
  
  // Function to handle creating a new vehicle
  const handleCreateVehicle = () => {
    // This function would open a dialog to create a new vehicle
    console.log("Create new vehicle");
    // Implement the actual vehicle creation functionality
  };

  const handleVehicleClick = (vehicle) => {
    console.log("Vehicle clicked:", vehicle);
    // Implement navigation to vehicle details page
  };

  return (
    <Layout>
      <div className="container mx-auto py-6 pb-16 md:pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4">
          <h1 className="text-3xl font-bold">Veículos</h1>
          
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                className="pl-8 max-w-[300px]"
                placeholder="Buscar veículo..." 
                value={searchTerm}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
            
            <Button onClick={handleCreateVehicle}>
              <Plus className="h-4 w-4 mr-2" />
              Novo Veículo
            </Button>
          </div>
        </div>
        
        <VehiclesFilter 
          viewMode={viewMode}
          setViewMode={setViewMode}
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={resetFilters}
        />
        
        {viewMode === 'table' ? (
          <VehiclesTable 
            vehicles={vehicles}
            isLoading={isLoading}
            onRefresh={refetch}
            onVehicleClick={handleVehicleClick}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-36 bg-muted rounded-lg animate-pulse" />
              ))
            ) : vehicles.length > 0 ? (
              vehicles.map((vehicle) => (
                <VehicleCard 
                  key={vehicle.id} 
                  vehicle={vehicle} 
                  onClick={() => handleVehicleClick(vehicle)}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-10">
                <p className="text-muted-foreground">Nenhum veículo encontrado</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Vehicles;
