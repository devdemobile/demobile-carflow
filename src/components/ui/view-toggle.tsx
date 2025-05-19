
import React from 'react';
import { Grid2X2, List } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

interface ViewToggleProps {
  viewMode: 'grid' | 'table';
  onViewChange: (mode: 'grid' | 'table') => void;
  className?: string;
}

/**
 * Componente padronizado para alternar entre visualizações em grade e tabela.
 * 
 * @param viewMode - Modo de visualização atual ('grid' ou 'table')
 * @param onViewChange - Função chamada quando o modo de visualização é alterado
 * @param className - Classes CSS adicionais para estilização personalizada
 */
const ViewToggle: React.FC<ViewToggleProps> = ({ 
  viewMode, 
  onViewChange,
  className = "" 
}) => {
  return (
    <ToggleGroup 
      type="single" 
      value={viewMode} 
      onValueChange={(value) => value && onViewChange(value as 'grid' | 'table')}
      className={`${className}`}
    >
      <ToggleGroupItem value="grid" aria-label="Ver em grade">
        <Grid2X2 className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem value="table" aria-label="Ver em tabela">
        <List className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
};

export default ViewToggle;
