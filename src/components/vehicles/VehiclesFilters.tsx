
import React from 'react';
import UnitFilter from '@/components/filters/UnitFilter';
import VehiclesFilter from './VehiclesFilter';

interface VehiclesFiltersProps {
  user: any;
  unitFilter: any;
  setSelectedUnit: (unitId: string | null) => void;
  setShowAllUnits: (showAll: boolean) => void;
  viewMode: 'grid' | 'table';
  setViewMode: (mode: 'grid' | 'table') => void;
  filters: any;
  handleFilterChange: (name: string, value: any) => void;
  resetFilters: () => void;
  headerActions: React.ReactNode;
  showViewToggle: boolean;
  availableMakes: any[];
  availableModels: any[];
  availableUnits: any[];
}

const VehiclesFilters: React.FC<VehiclesFiltersProps> = ({
  user,
  unitFilter,
  setSelectedUnit,
  setShowAllUnits,
  viewMode,
  setViewMode,
  filters,
  handleFilterChange,
  resetFilters,
  headerActions,
  showViewToggle,
  availableMakes,
  availableModels,
  availableUnits
}) => {
  return (
    <>
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
        showViewToggle={showViewToggle}
        availableMakes={availableMakes}
        availableModels={availableModels}
        availableUnits={availableUnits}
      />
    </>
  );
};

export default VehiclesFilters;
