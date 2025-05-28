
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Plus, Tag, Cog } from 'lucide-react';
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
import MakesDialog from '@/components/vehicles/makes/MakesDialog';
import ModelsDialog from '@/components/vehicles/models/ModelsDialog';

const Vehicles = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { user, userPermissions } = useAuth();
  const [isMakesDialogOpen, setIsMakesDialogOpen] = useState(false);
  const [isModelsDialogOpen, setIsModelsDialogOpen] = useState(false);
  
  const { 
    vehicles, 
    isLoading,
    refetch,
    filters, 
    handleFilterChange, 
    resetFilters,
    selectedVehicle,
    isVehicleDetailsOpen,
    openVehicleDetails,
    closeVehicleDetails,
    isAddVehicleOpen,
    openAddVehicle,
    closeAddVehicle,
    viewMode,
    setViewMode,
    // Dados para os filtros
    makeOptions,
    modelOptions,
    unitOptions
  } = useVehicles();
  
  // Redirecionar se o usuário não tem permissão
  if (userPermissions && !userPermissions.canViewVehicles) {
    toast.error('Você não tem permissão para visualizar veículos');
    return <Navigate to="/" />;
  }

  // Filtrar veículos pela unidade do usuário se não for admin
  const filteredVehicles = React.useMemo(() => {
    if (user?.role === 'admin') {
      return vehicles; // Admin vê todos os veículos
    }
    
    // Operadores só veem veículos da sua unidade
    return vehicles.filter(vehicle => vehicle.unitId === user?.unitId);
  }, [vehicles, user?.role, user?.unitId]);

  // Definir as ações do cabeçalho
  const headerActions = userPermissions?.canEditVehicles ? (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setIsMakesDialogOpen(true)}
        aria-label="Gerenciar marcas"
      >
        <Tag className="h-4 w-4" />
        {!isMobile && <span className="ml-1">Marcas</span>}
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setIsModelsDialogOpen(true)}
        aria-label="Gerenciar modelos"
      >
        <Cog className="h-4 w-4" />
        {!isMobile && <span className="ml-1">Modelos</span>}
      </Button>
      <Button onClick={openAddVehicle}>
        <Plus className="h-4 w-4" />
        {!isMobile && <span className="ml-2">Novo Veículo</span>}
      </Button>
    </>
  ) : null;

  return (
    <Layout>
      <div className="container mx-auto py-6 pb-16 md:pb-6">
        <VehiclesFilter 
          viewMode={viewMode}
          setViewMode={setViewMode}
          filters={filters}
          onFilterChange={handleFilterChange}
          onReset={resetFilters}
          actions={headerActions}
          showViewToggle={!isMobile}
          availableMakes={makeOptions}
          availableModels={modelOptions}
          availableUnits={user?.role === 'admin' ? unitOptions : unitOptions.filter(u => u.value === user?.unitId)}
        />
        
        {/* Indicador de filtro por unidade */}
        {user?.role !== 'admin' && (
          <div className="mb-4 p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Filtro ativo:</strong> Exibindo apenas veículos da {user?.unitName}
            </p>
          </div>
        )}
        
        {viewMode === 'table' ? (
          <VehiclesTable 
            vehicles={filteredVehicles}
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
            ) : filteredVehicles.length > 0 ? (
              filteredVehicles.map((vehicle) => (
                <VehicleCard 
                  key={vehicle.id} 
                  vehicle={vehicle} 
                  onClick={openVehicleDetails}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-10">
                <p className="text-muted-foreground">
                  Nenhum veículo encontrado
                  {user?.role !== 'admin' && ` na ${user?.unitName}`}
                </p>
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
      
      {/* Diálogos de gerenciamento de marcas e modelos */}
      <MakesDialog
        isOpen={isMakesDialogOpen}
        onClose={() => setIsMakesDialogOpen(false)}
      />
      
      <ModelsDialog
        isOpen={isModelsDialogOpen}
        onClose={() => setIsModelsDialogOpen(false)}
      />
    </Layout>
  );
};

export default Vehicles;
