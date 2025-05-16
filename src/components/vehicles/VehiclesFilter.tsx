
import React from 'react';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { 
  Filter as FilterIcon,
  Search as SearchIcon,
  Grid as GridIcon,
  List as ListIcon
} from 'lucide-react';
import { VehicleLocation } from '@/types';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

type FilterValues = {
  search: string;
  location: VehicleLocation | null;
};

interface VehiclesFilterProps {
  filters: FilterValues;
  onFilterChange: (name: string, value: string | null) => void;
  onReset: () => void;
  viewMode: 'grid' | 'table';
  setViewMode: (mode: 'grid' | 'table') => void;
}

const VehiclesFilter: React.FC<VehiclesFilterProps> = ({ 
  filters, 
  onFilterChange, 
  onReset,
  viewMode,
  setViewMode
}) => {
  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Buscar por placa, marca, modelo ou cor..."
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
          />
        </div>

        <Select 
          value={filters.location || ''}
          onValueChange={(value) => {
            // Convert 'all' to null for the filter
            const locationValue = value === 'all' ? null : value as VehicleLocation | null;
            onFilterChange('location', locationValue);
          }}
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Localização" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="yard">No pátio</SelectItem>
            <SelectItem value="out">Em uso</SelectItem>
          </SelectContent>
        </Select>

        <Button 
          variant="outline" 
          className="flex items-center gap-2" 
          onClick={onReset}
        >
          <FilterIcon className="h-4 w-4" />
          <span>Limpar Filtros</span>
        </Button>
      </div>
      
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Veículos</h2>
        <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as 'grid' | 'table')}>
          <ToggleGroupItem value="grid" aria-label="Ver em grade">
            <GridIcon className="h-4 w-4" />
          </ToggleGroupItem>
          <ToggleGroupItem value="table" aria-label="Ver em tabela">
            <ListIcon className="h-4 w-4" />
          </ToggleGroupItem>
        </ToggleGroup>
      </div>
    </div>
  );
};

export default VehiclesFilter;
