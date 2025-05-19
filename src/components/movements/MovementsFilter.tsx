
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Filter, Search } from 'lucide-react';
import ViewToggle from '@/components/ui/view-toggle';

interface MovementsFilterProps {
  filters: {
    search: string;
    status: string | null;
  };
  viewMode: 'grid' | 'table';
  setViewMode: (mode: 'grid' | 'table') => void;
  onFilterChange: (name: string, value: string | null) => void;
  onReset: () => void;
}

const MovementsFilter: React.FC<MovementsFilterProps> = ({ 
  filters, 
  onFilterChange, 
  onReset,
  viewMode,
  setViewMode 
}) => {
  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Buscar por placa, motorista, unidade..."
            value={filters.search}
            onChange={(e) => onFilterChange('search', e.target.value)}
          />
        </div>
        
        <Select
          value={filters.status || "all"}
          onValueChange={(value) => onFilterChange('status', value === "all" ? null : value)}
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="yard">No Pátio</SelectItem>
            <SelectItem value="out">Em Rota</SelectItem>
          </SelectContent>
        </Select>
        
        <Button 
          variant="outline" 
          className="flex items-center gap-2 sm:w-auto" 
          onClick={onReset}
        >
          <Filter className="h-4 w-4" />
          <span>Limpar</span>
        </Button>
      </div>
      
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Movimentações</h2>
        <ViewToggle viewMode={viewMode} onViewChange={setViewMode} />
      </div>
    </div>
  );
};

export default MovementsFilter;
