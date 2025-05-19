
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, X } from 'lucide-react';
import { VehicleFilters } from '@/hooks/useVehicles';
import ViewToggle from '@/components/ui/view-toggle';

interface VehiclesFilterProps {
  viewMode: 'grid' | 'table';
  setViewMode: (mode: 'grid' | 'table') => void;
  filters: VehicleFilters;
  onFilterChange: (name: string, value: string) => void;
  onReset: () => void;
}

const VehiclesFilter: React.FC<VehiclesFilterProps> = ({
  viewMode,
  setViewMode,
  filters,
  onFilterChange,
  onReset
}) => {
  return (
    <Card className="p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <Input
              placeholder="Buscar por placa..."
              value={filters.plate || ''}
              onChange={(e) => onFilterChange('plate', e.target.value)}
              className="w-full"
            />
          </div>
          
          <div>
            <Select 
              value={filters.make || ''} 
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
          </div>
          
          <div>
            <Select 
              value={filters.status || ''} 
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
        </div>
        
        <div className="flex items-center justify-end gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onReset}
          >
            <X className="h-4 w-4 mr-1" />
            Limpar
          </Button>
          <Button size="sm">
            <Filter className="h-4 w-4 mr-1" />
            Filtrar
          </Button>
          
          <ViewToggle 
            viewMode={viewMode} 
            onViewChange={setViewMode}
          />
        </div>
      </div>
    </Card>
  );
};

export default VehiclesFilter;
