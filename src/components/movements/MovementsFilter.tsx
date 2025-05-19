
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PageHeader from '@/components/layout/PageHeader';

interface MovementsFilterProps {
  viewMode: 'grid' | 'table';
  setViewMode: (mode: 'grid' | 'table') => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string | null;
  onStatusFilterChange: (value: string | null) => void;
  onReset: () => void;
  actions?: React.ReactNode;
  showViewToggle?: boolean;
}

const MovementsFilter: React.FC<MovementsFilterProps> = ({
  viewMode,
  setViewMode,
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  onReset,
  actions,
  showViewToggle = true
}) => {
  return (
    <PageHeader
      searchPlaceholder="Buscar por veículo, motorista..."
      searchValue={searchTerm}
      onSearchChange={onSearchChange}
      onResetFilters={onReset}
      viewMode={viewMode}
      setViewMode={setViewMode}
      actions={actions}
      showViewToggle={showViewToggle}
    >
      <div className="flex gap-2 items-center">
        <Select
          value={statusFilter || "all"}
          onValueChange={(value) => onStatusFilterChange(value === "all" ? null : value)}
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="out">Em Rota</SelectItem>
            <SelectItem value="yard">No Pátio</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </PageHeader>
  );
};

export default MovementsFilter;
