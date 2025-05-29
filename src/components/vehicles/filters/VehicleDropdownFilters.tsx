
import React, { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface VehicleDropdownFiltersProps {
  filters: any;
  onFilterChange: (name: string, value: string) => void;
  availableMakes: Array<{ value: string; label: string }>;
  availableModels: Array<{ value: string; label: string }>;
  availableUnits: Array<{ value: string; label: string }>;
}

type FilterKey = 'status' | 'make' | 'model' | 'unitId';

const VehicleDropdownFilters: React.FC<VehicleDropdownFiltersProps> = ({
  filters,
  onFilterChange,
  availableMakes,
  availableModels,
  availableUnits
}) => {
  const [selectedFilterKey, setSelectedFilterKey] = useState<FilterKey>('status');
  
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

  const handleFilterKeyChange = (value: string) => {
    setSelectedFilterKey(value as FilterKey);
  };

  const handleFilterValueChange = (value: string) => {
    onFilterChange(selectedFilterKey, value);
  };

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
  );
};

export default VehicleDropdownFilters;
