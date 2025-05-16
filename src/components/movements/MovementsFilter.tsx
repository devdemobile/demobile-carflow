
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
  Search as SearchIcon 
} from 'lucide-react';
import { VehicleLocation } from '@/types';

type FilterValues = {
  search: string;
  status: VehicleLocation | null;
  dateRange: string;
};

interface MovementsFilterProps {
  filters: FilterValues;
  onFilterChange: (name: string, value: string | null) => void;
  onReset: () => void;
}

const MovementsFilter: React.FC<MovementsFilterProps> = ({ filters, onFilterChange, onReset }) => {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-6">
      <div className="relative flex-1">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Buscar por placa, motorista ou destino..."
          value={filters.search}
          onChange={(e) => onFilterChange('search', e.target.value)}
        />
      </div>

      <Select 
        value={filters.status || undefined}
        onValueChange={(value: VehicleLocation | undefined) => onFilterChange('status', value || null)}
      >
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="yard">Completados</SelectItem>
          <SelectItem value="out">Em Andamento</SelectItem>
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
  );
};

export default MovementsFilter;
