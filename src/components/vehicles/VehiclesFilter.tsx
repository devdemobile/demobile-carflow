
import React from 'react';
import PageHeader from '@/components/layout/PageHeader';
import VehicleDropdownFilters from './filters/VehicleDropdownFilters';
import VehicleFilterTags from './filters/VehicleFilterTags';
import { VehicleFilters } from '@/hooks/useVehicles';

interface VehiclesFilterProps {
  viewMode: 'grid' | 'table';
  setViewMode: (mode: 'grid' | 'table') => void;
  filters: VehicleFilters;
  onFilterChange: (name: string, value: string) => void;
  onReset: () => void;
  actions?: React.ReactNode;
  showViewToggle?: boolean;
  availableMakes: Array<{ value: string; label: string }>;
  availableModels: Array<{ value: string; label: string }>;
  availableUnits: Array<{ value: string; label: string }>;
}

const VehiclesFilter: React.FC<VehiclesFilterProps> = ({
  viewMode,
  setViewMode,
  filters,
  onFilterChange,
  onReset,
  actions,
  showViewToggle = true,
  availableMakes,
  availableModels,
  availableUnits
}) => {
  const removeFilter = (key: string) => {
    console.log('Removendo filtro:', key);
    onFilterChange(key, 'all');
  };

  const handleSearchChange = (value: string) => {
    console.log('Aplicando busca:', value);
    onFilterChange('search', value);
  };

  return (
    <>
      <PageHeader
        title="Veículos"
        searchPlaceholder="Buscar por placa, marca, modelo, cor..."
        searchValue={filters.search || ''}
        onSearchChange={handleSearchChange}
        onResetFilters={onReset}
        viewMode={viewMode}
        setViewMode={setViewMode}
        actions={actions}
        showViewToggle={showViewToggle}
      >
        <VehicleDropdownFilters
          filters={filters}
          onFilterChange={onFilterChange}
          availableMakes={availableMakes}
          availableModels={availableModels}
          availableUnits={availableUnits}
        />
      </PageHeader>
      
      <VehicleFilterTags
        filters={filters}
        onRemoveFilter={removeFilter}
        onResetAll={onReset}
        availableMakes={availableMakes}
        availableModels={availableModels}
        availableUnits={availableUnits}
      />
    </>
  );
};

export default VehiclesFilter;
