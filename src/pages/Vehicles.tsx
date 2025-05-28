
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
import UnitFilter from '@/components/filters/UnitFilter';
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
    // Dados para os filtros
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

  const handleVehicleClick = (vehicle: any) => {
    // Verificar se o usuário pode editar o veículo
    if (!canEditInUnit(vehicle.unitId)) {
      toast.warning('Você pode visualizar este veículo, mas não pode editá-lo pois pertence a outra unidade.');
    }
    openVehicleDetails(vehicle);
  };

  return (
    <Layout>
      <div className="container mx-auto py-6 pb-16 md:pb-6">
        {/* Unit Filter */}
        {(user?.role === 'admin' || user?.permissions?.canViewUnits) && (
          <div className="mb-4 bg-card border rounded-lg p-4">
            <UnitFilter
              selectedUnitId={unitFilter.selectedUnitId}
              showAllUnits={unitFilter.showAllUnits}
              onUnitChange={setSelectedUnit}
              onShowAllChange={setShowAllUnits}
              label="Filtro Global por Unidade"
            />
          </div>
        )}

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
                <div key={index} className="h-56 bg-muted rounded-lg animate-pulse" />
              ))
            ) : vehicles.length > 0 ? (
              vehicles.map((vehicle) => (
                <VehicleCard 
                  key={vehicle.id} 
                  vehicle={vehicle} 
                  onClick={handleVehicleClick}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-10">
                <p className="text-muted-foreground">
                  Nenhum veículo encontrado com os filtros aplicados.
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
