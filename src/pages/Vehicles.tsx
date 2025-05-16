import React from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Search } from 'lucide-react';
import { useVehicles } from '@/hooks/useVehicles';
import VehiclesTable from '@/components/vehicles/VehiclesTable';
import VehiclesFilter from '@/components/vehicles/VehiclesFilter';
import VehicleCard from '@/components/vehicles/VehicleCard';
import { useMediaQuery } from '@/hooks/use-mobile';
import VehicleDetails from '@/components/vehicles/VehicleDetails';
import VehicleForm from '@/components/vehicles/VehicleForm';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { Navigate } from 'react-router-dom';

const Vehicles = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { userPermissions } = useAuth();
  
  const { 
    vehicles, 
    isLoading,
    refetch,
    viewMode, 
    setViewMode, 
    filters, 
    handleFilterChange, 
    resetFilters,
    selectedVehicle,
    isVehicleDetailsOpen,
    openVehicleDetails,
    closeVehicleDetails,
    isAddVehicleOpen,
    openAddVehicle,
    closeAddVehicle
  } = useVehicles();
  
  // Redirecionar se o usuário não tem permissão
  if (userPermissions && !userPermissions.canViewVehicles) {
    toast.error('Você não tem permissão para visualizar veículos');
    return <Navigate to="/" />;
  }

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
                placeholder="Buscar por placa, marca, modelo..." 
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
            
            {userPermissions?.canEditVehicles && (
              <Button onClick={openAddVehicle}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Veículo
              </Button>
            )}
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
            onVehicleClick={openVehicleDetails}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-6">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-56 bg-muted rounded-lg animate-pulse" />
              ))
            ) : vehicles.length > 0 ? (
              vehicles.map((vehicle) => (
                <VehicleCard 
                  key={vehicle.id} 
                  vehicle={vehicle} 
                  onClick={openVehicleDetails}
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

      {/* Modal de detalhes do veículo */}
      {selectedVehicle && (
        <VehicleDetails
          vehicle={selectedVehicle}
          isOpen={isVehicleDetailsOpen}
          onClose={closeVehicleDetails}
          onEdit={refetch}
          onDelete={refetch}
        />
      )}

      {/* Modal de adição de veículo */}
      <VehicleForm
        isOpen={isAddVehicleOpen}
        onClose={closeAddVehicle}
        onSave={refetch}
      />
    </Layout>
  );
};

export default Vehicles;
