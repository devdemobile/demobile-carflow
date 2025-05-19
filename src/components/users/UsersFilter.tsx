
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import PageHeader from '@/components/layout/PageHeader';

interface UsersFilterProps {
  viewMode: 'grid' | 'table';
  setViewMode: (mode: 'grid' | 'table') => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  roleFilter: string | null;
  onRoleFilterChange: (value: string | null) => void;
  onReset: () => void;
  actions?: React.ReactNode;
}

const UsersFilter: React.FC<UsersFilterProps> = ({
  viewMode,
  setViewMode,
  searchTerm,
  onSearchChange,
  roleFilter,
  onRoleFilterChange,
  onReset,
  actions
}) => {
  return (
    <PageHeader
      searchPlaceholder="Buscar por nome, email..."
      searchValue={searchTerm}
      onSearchChange={onSearchChange}
      onResetFilters={onReset}
      viewMode={viewMode}
      setViewMode={setViewMode}
      actions={actions}
    >
      <Select
        value={roleFilter || "all"}
        onValueChange={(value) => onRoleFilterChange(value === "all" ? null : value)}
      >
        <SelectTrigger className="w-full md:w-[180px]">
          <SelectValue placeholder="Perfil" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="admin">Administrador</SelectItem>
          <SelectItem value="manager">Gerente</SelectItem>
          <SelectItem value="operator">Operador</SelectItem>
          <SelectItem value="viewer">Visualizador</SelectItem>
        </SelectContent>
      </Select>
    </PageHeader>
  );
};

export default UsersFilter;
