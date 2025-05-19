
import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { VehicleFilters } from '@/hooks/useVehicles';
import PageHeader from '@/components/layout/PageHeader';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface VehiclesFilterProps {
  viewMode: 'grid' | 'table';
  setViewMode: (mode: 'grid' | 'table') => void;
  filters: VehicleFilters;
  onFilterChange: (name: string, value: string) => void;
  onReset: () => void;
  actions?: React.ReactNode;
  showViewToggle?: boolean;
  // Props para os filtros dinâmicos
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
      ...(availableMakes || [])
    ],
    model: [
      { value: 'all', label: 'Todos os modelos' },
      ...(availableModels || [])
    ],
    unitId: [
      { value: 'all', label: 'Todas as unidades' },
      ...(availableUnits || [])
    ]
  };

  // Handler para mudar o tipo de filtro
  const handleFilterKeyChange = (value: string) => {
    setSelectedFilterKey(value as FilterKey);
  };

  // Handler para mudar o valor do filtro
  const handleFilterValueChange = (value: string) => {
    onFilterChange(selectedFilterKey, value);
  };

  // Remover um filtro específico
  const removeFilter = (key: string) => {
    onFilterChange(key, 'all');
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

  // Gerar rótulos legíveis para os filtros aplicados
  const getFilterLabel = (key: string, value: string): string | null => {
    if (value === 'all' || !value) return null;
    
    switch (key) {
      case 'status':
        return value === 'yard' ? 'No Pátio' : 'Em Rota';
      case 'make':
        const makeItem = filterOptions.make.find(item => item.value === value);
        return makeItem ? `Marca: ${makeItem.label}` : null;
      case 'model':
        const modelItem = filterOptions.model.find(item => item.value === value);
        return modelItem ? `Modelo: ${modelItem.label}` : null;
      case 'unitId':
        const unitItem = filterOptions.unitId.find(item => item.value === value);
        return unitItem ? `Unidade: ${unitItem.label}` : null;
      case 'plate':
        return `Placa: ${value}`;
      default:
        return null;
    }
  };

  // Verificar quais filtros estão ativos para exibir as tags
  const getActiveFilters = () => {
    const activeFilters = [];
    
    if (filters.status && filters.status !== 'all') {
      activeFilters.push({ key: 'status', value: filters.status, label: getFilterLabel('status', filters.status) });
    }
    
    if (filters.make && filters.make !== 'all') {
      activeFilters.push({ key: 'make', value: filters.make, label: getFilterLabel('make', filters.make) });
    }
    
    if (filters.model && filters.model !== 'all') {
      activeFilters.push({ key: 'model', value: filters.model, label: getFilterLabel('model', filters.model) });
    }
    
    if (filters.unitId && filters.unitId !== 'all') {
      activeFilters.push({ key: 'unitId', value: filters.unitId, label: getFilterLabel('unitId', filters.unitId) });
    }
    
    if (filters.plate) {
      activeFilters.push({ key: 'plate', value: filters.plate, label: `Placa: ${filters.plate}` });
    }
    
    return activeFilters;
  };

  const activeFilters = getActiveFilters();

  return (
    <>
      <PageHeader
        title="Veículos"
        searchPlaceholder="Buscar por placa, marca, modelo, cor..."
        searchValue={filters.search || ''}
        onSearchChange={(value) => onFilterChange('search', value)}
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
      
      {/* Exibir tags dos filtros aplicados */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2 mb-4 px-4">
          {activeFilters.map(filter => (
            <Badge 
              key={`${filter.key}-${filter.value}`} 
              variant="secondary"
              className="px-3 py-1 flex items-center gap-1"
            >
              {filter.label}
              <button 
                onClick={() => removeFilter(filter.key)}
                className="ml-1 hover:bg-muted rounded-full p-0.5"
                aria-label={`Remover filtro ${filter.label}`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          
          {activeFilters.length > 1 && (
            <button 
              onClick={onReset}
              className="text-xs text-muted-foreground hover:text-primary underline ml-2 flex items-center"
            >
              Limpar todos
            </button>
          )}
        </div>
      )}
    </>
  );
};

export default VehiclesFilter;
