
import React, { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, X } from 'lucide-react';
import ViewToggle from '@/components/ui/view-toggle';

interface PageHeaderProps {
  title: string;
  searchPlaceholder?: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onResetFilters: () => void;
  viewMode: 'grid' | 'table';
  setViewMode: (mode: 'grid' | 'table') => void;
  children?: ReactNode;
  actions?: ReactNode;
}

/**
 * Componente padronizado para cabeçalho de página com busca e alternância de visualização
 */
const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  searchPlaceholder = "Buscar...",
  searchValue,
  onSearchChange,
  onResetFilters,
  viewMode,
  setViewMode,
  children,
  actions
}) => {
  return (
    <div className="space-y-4 mb-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{title}</h1>
        <div className="flex items-center gap-2">
          {actions}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        
        {children}
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={onResetFilters}
            size="icon"
            className="shrink-0"
            aria-label="Limpar filtros"
          >
            <X className="h-4 w-4" />
          </Button>
          
          <ViewToggle
            viewMode={viewMode}
            onViewChange={setViewMode}
            className="ml-2"
          />
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
