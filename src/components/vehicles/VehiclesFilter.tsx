
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { VehicleFilters } from '@/hooks/useVehicles';
import PageHeader from '@/components/layout/PageHeader';

interface VehiclesFilterProps {
  viewMode: 'grid' | 'table';
  setViewMode: (mode: 'grid' | 'table') => void;
  filters: VehicleFilters;
  onFilterChange: (name: string, value: string) => void;
  onReset: () => void;
  actions?: React.ReactNode;
}

const VehiclesFilter: React.FC<VehiclesFilterProps> = ({
  viewMode,
  setViewMode,
  filters,
  onFilterChange,
  onReset,
  actions
}) => {
  return (
    <PageHeader
      title="Veículos"
      searchPlaceholder="Buscar por placa..."
      searchValue={filters.plate || ''}
      onSearchChange={(value) => onFilterChange('plate', value)}
      onResetFilters={onReset}
      viewMode={viewMode}
      setViewMode={setViewMode}
      actions={actions}
    >
      <div className="grid grid-cols-2 gap-3">
        <Select 
          value={filters.make || 'all'} 
          onValueChange={(value) => onFilterChange('make', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Marca" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as marcas</SelectItem>
            <SelectItem value="volkswagen">Volkswagen</SelectItem>
            <SelectItem value="toyota">Toyota</SelectItem>
            <SelectItem value="honda">Honda</SelectItem>
          </SelectContent>
        </Select>
        
        <Select 
          value={filters.status || 'all'} 
          onValueChange={(value) => onFilterChange('status', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os status</SelectItem>
            <SelectItem value="available">Disponível</SelectItem>
            <SelectItem value="in_use">Em uso</SelectItem>
            <SelectItem value="maintenance">Em manutenção</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </PageHeader>
  );
};

export default VehiclesFilter;
