
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
  showInactiveUsers?: boolean;
  onStatusChange?: (value: boolean) => void;
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
  showInactiveUsers,
  onStatusChange,
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
      <div className="flex gap-2 items-center">
        {onStatusChange && (
          <div className="flex items-center gap-2 mr-2">
            <button
              onClick={() => onStatusChange(!showInactiveUsers)}
              className={`px-4 py-2 rounded-md text-white transition-colors ${
                !showInactiveUsers ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'
              }`}
            >
              {!showInactiveUsers ? 'Ativos' : 'Inativos'}
            </button>
          </div>
        )}
        
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
            <SelectItem value="operator">Operador</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </PageHeader>
  );
};

export default UsersFilter;
