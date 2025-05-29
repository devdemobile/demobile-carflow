
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface VehicleFilterTagsProps {
  filters: any;
  onRemoveFilter: (key: string) => void;
  onResetAll: () => void;
  availableMakes: Array<{ value: string; label: string }>;
  availableModels: Array<{ value: string; label: string }>;
  availableUnits: Array<{ value: string; label: string }>;
}

const VehicleFilterTags: React.FC<VehicleFilterTagsProps> = ({
  filters,
  onRemoveFilter,
  onResetAll,
  availableMakes,
  availableModels,
  availableUnits
}) => {
  const getFilterLabel = (key: string, value: string): string | null => {
    if (value === 'all' || !value) return null;
    
    switch (key) {
      case 'status':
        return value === 'yard' ? 'No Pátio' : 'Em Rota';
      case 'make':
        const makeItem = availableMakes.find(item => item.value === value);
        return makeItem ? `Marca: ${makeItem.label}` : null;
      case 'model':
        const modelItem = availableModels.find(item => item.value === value);
        return modelItem ? `Modelo: ${modelItem.label}` : null;
      case 'unitId':
        const unitItem = availableUnits.find(item => item.value === value);
        return unitItem ? `Unidade: ${unitItem.label}` : null;
      case 'plate':
        return `Placa: ${value}`;
      default:
        return null;
    }
  };

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

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2 mt-2 mb-4 px-4">
      {activeFilters.map(filter => (
        <Badge 
          key={`${filter.key}-${filter.value}`} 
          variant="secondary"
          className="px-3 py-1 flex items-center gap-1"
        >
          {filter.label}
          <button 
            onClick={() => onRemoveFilter(filter.key)}
            className="ml-1 hover:bg-muted rounded-full p-0.5"
            aria-label={`Remover filtro ${filter.label}`}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      
      {activeFilters.length > 1 && (
        <button 
          onClick={onResetAll}
          className="text-xs text-muted-foreground hover:text-primary underline ml-2 flex items-center"
        >
          Limpar todos
        </button>
      )}
    </div>
  );
};

export default VehicleFilterTags;
