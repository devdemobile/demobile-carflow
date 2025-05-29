
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { useVehicles } from '@/hooks/useVehicles';
import VehicleDetails from '@/components/vehicles/VehicleDetails';
import VehicleForm from '@/components/vehicles/VehicleForm';
import VehiclesFilters from '@/components/vehicles/VehiclesFilters';
import VehiclesContent from '@/components/vehicles/VehiclesContent';
import VehiclesActions from '@/components/vehicles/VehiclesActions';
import { useMediaQuery } from '@/hooks/use-mobile';
import { useAuth } from '@/hooks/useAuth';
import { useUnitFilter } from '@/hooks/useUnitFilter';
import { toast } from 'sonner';
import { Navigate } from 'react-router-dom';
import MakesDialog from '@/components/vehicles/makes/MakesDialog';
import ModelsDialog from '@/components/vehicles/models/ModelsDialog';

const Vehicles = () => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const { user, userPermissions } = useAuth();
  const { filter: unitFilter, setShowAllUnits, setSelectedUnit } = useUnitFilter();
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
    makeOptions,
    modelOptions,
    unitOptions,
    canEditInUnit
  } = useVehicles();
  
  // Redirecionar se o usuário não tem permissão
  if (userPermissions && !userPermissions.canViewVehicles) {
    toast.error('Você não tem permissão para visualizar veículos');
    return <Navigate to="/" />;
  }

  const handleVehicleClick = (vehicle: any) => {
    if (!canEditInUnit(vehicle.unitId)) {
      toast.warning('Você pode visualizar este veículo, mas não pode editá-lo pois pertence a outra unidade.');
    }
    openVehicleDetails(vehicle);
  };

  const headerActions = (
    <VehiclesActions
      userPermissions={userPermissions}
      isMobile={isMobile}
      onOpenMakes={() => setIsMakesDialogOpen(true)}
      onOpenModels={() => setIsModelsDialogOpen(true)}
      onOpenAddVehicle={openAddVehicle}
    />
  );

  return (
    <Layout>
      <div className="container mx-auto py-6 pb-16 md:pb-6">
        <VehiclesFilters
          user={user}
          unitFilter={unitFilter}
          setSelectedUnit={setSelectedUnit}
          setShowAllUnits={setShowAllUnits}
          viewMode={viewMode}
          setViewMode={setViewMode}
          filters={filters}
          handleFilterChange={handleFilterChange}
          resetFilters={resetFilters}
          headerActions={headerActions}
          showViewToggle={!isMobile}
          availableMakes={makeOptions}
          availableModels={modelOptions}
          availableUnits={unitFilter.showAllUnits ? unitOptions : unitOptions.filter(u => u.value === unitFilter.selectedUnitId)}
        />
        
        {/* Indicador de filtro por unidade */}
        {!unitFilter.showAllUnits && unitFilter.selectedUnitId && (
          <div className="mb-4 p-3 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground">
              <strong>Filtro ativo:</strong> Exibindo apenas veículos da unidade filtrada.
              {user?.role !== 'admin' && " Você só pode editar/criar veículos da sua própria unidade."}
            </p>
          </div>
        )}

        {unitFilter.showAllUnits && user?.role !== 'admin' && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-sm text-amber-800">
              <strong>Visualização ampliada:</strong> Você está vendo veículos de todas as unidades, mas só pode editar/criar veículos da sua unidade ({user?.unitName}).
            </p>
          </div>
        )}
        
        <VehiclesContent
          viewMode={viewMode}
          vehicles={vehicles}
          isLoading={isLoading}
          refetch={refetch}
          onVehicleClick={handleVehicleClick}
        />
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
