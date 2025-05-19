
import React, { useState, useEffect } from 'react';
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
  showViewToggle?: boolean;
  // Novos props para os filtros dinâmicos
  availableMakes: Array<{ value: string; label: string }>;
  availableModels: Array<{ value: string; label: string }>;
  availableUnits: Array<{ value: string; label: string }>;
}

// Tipos de filtros disponíveis
type FilterKey = 'status' | 'make' | 'model' | 'unitId';

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
  // Estado para o tipo de filtro selecionado
  const [selectedFilterKey, setSelectedFilterKey] = useState<FilterKey>('status');
  
  // Valores disponíveis para cada tipo de filtro
  const filterOptions: Record<FilterKey, Array<{ value: string; label: string }>> = {
    status: [
      { value: 'all', label: 'Todos os status' },
      { value: 'yard', label: 'No Pátio' },
      { value: 'out', label: 'Em Rota' }
    ],
    make: [
      { value: 'all', label: 'Todas as marcas' },
      ...availableMakes
    ],
    model: [
      { value: 'all', label: 'Todos os modelos' },
      ...availableModels
    ],
    unitId: [
      { value: 'all', label: 'Todas as unidades' },
      ...availableUnits
    ]
  };

  // Quando o tipo de filtro muda, resetamos o valor para 'all'
  useEffect(() => {
    onFilterChange(selectedFilterKey, 'all');
  }, [selectedFilterKey, onFilterChange]);

  // Handler para mudar o tipo de filtro
  const handleFilterKeyChange = (value: string) => {
    setSelectedFilterKey(value as FilterKey);
  };

  // Handler para mudar o valor do filtro
  const handleFilterValueChange = (value: string) => {
    onFilterChange(selectedFilterKey, value);
  };

  // Determinar qual valor está atualmente selecionado para o filtro ativo
  const getCurrentFilterValue = () => {
    switch (selectedFilterKey) {
      case 'status':
        return filters.status || 'all';
      case 'make':
        return filters.make || 'all';
      case 'model':
        return filters.model || 'all';
      case 'unitId':
        return filters.unitId || 'all';
      default:
        return 'all';
    }
  };

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
      showViewToggle={showViewToggle}
    >
      <div className="grid grid-cols-2 gap-3">
        <Select 
          value={selectedFilterKey} 
          onValueChange={handleFilterKeyChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Tipo de filtro" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="status">Status</SelectItem>
            <SelectItem value="make">Marca</SelectItem>
            <SelectItem value="model">Modelo</SelectItem>
            <SelectItem value="unitId">Unidade</SelectItem>
          </SelectContent>
        </Select>
        
        <Select 
          value={getCurrentFilterValue()} 
          onValueChange={handleFilterValueChange}
        >
          <SelectTrigger>
            <SelectValue placeholder="Valor" />
          </SelectTrigger>
          <SelectContent>
            {filterOptions[selectedFilterKey].map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </PageHeader>
  );
};

export default VehiclesFilter;
