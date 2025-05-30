
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
  const handleStatusChange = (value: string) => {
    console.log('Mudando status filter para:', value);
    // Converter 'all' para null para resetar o filtro
    const statusValue = value === "all" ? null : value;
    onStatusFilterChange(statusValue);
  };

  return (
    <PageHeader
      title="Movimentações"
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
          onValueChange={handleStatusChange}
        >
          <SelectTrigger className="w-full md:w-[180px] bg-background border">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-background border z-50">
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
