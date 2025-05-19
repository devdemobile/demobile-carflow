
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PageHeader from '@/components/layout/PageHeader';

interface MovementsFilterProps {
  filters: {
    search: string;
    status: string | null;
  };
  viewMode: 'grid' | 'table';
  setViewMode: (mode: 'grid' | 'table') => void;
  onFilterChange: (name: string, value: string | null) => void;
  onReset: () => void;
  actions?: React.ReactNode;
}

const MovementsFilter: React.FC<MovementsFilterProps> = ({ 
  filters, 
  onFilterChange, 
  onReset,
  viewMode,
  setViewMode,
  actions
}) => {
  return (
    <PageHeader
      title="Movimentações"
      searchPlaceholder="Buscar por placa, motorista, unidade..."
      searchValue={filters.search}
      onSearchChange={(value) => onFilterChange('search', value)}
      onResetFilters={onReset}
      viewMode={viewMode}
      setViewMode={setViewMode}
      actions={actions}
    >
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
    </PageHeader>
  );
};

export default MovementsFilter;
