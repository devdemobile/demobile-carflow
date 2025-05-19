
import React from 'react';
import PageHeader from '@/components/layout/PageHeader';

interface UnitsFilterProps {
  viewMode: 'grid' | 'table';
  setViewMode: (mode: 'grid' | 'table') => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  onReset: () => void;
  actions?: React.ReactNode;
  isLoading?: boolean;
}

const UnitsFilter: React.FC<UnitsFilterProps> = ({
  viewMode,
  setViewMode,
  searchTerm,
  setSearchTerm,
  onReset,
  actions,
  isLoading
}) => {
  return (
    <PageHeader
      searchPlaceholder="Buscar unidade..."
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      onResetFilters={onReset}
      viewMode={viewMode}
      setViewMode={setViewMode}
      actions={actions}
    />
  );
};

export default UnitsFilter;
