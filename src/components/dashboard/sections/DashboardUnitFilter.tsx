
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useUnits } from '@/hooks/useUnits';

interface DashboardUnitFilterProps {
  selectedUnitId: string | null;
  showAllUnits: boolean;
  onUnitChange: (unitId: string | null) => void;
  onShowAllChange: (showAll: boolean) => void;
}

const DashboardUnitFilter: React.FC<DashboardUnitFilterProps> = ({
  selectedUnitId,
  showAllUnits,
  onUnitChange,
  onShowAllChange
}) => {
  const { units } = useUnits();

  const handleValueChange = (value: string) => {
    if (value === 'all') {
      onShowAllChange(true);
      onUnitChange(null);
    } else {
      onShowAllChange(false);
      onUnitChange(value);
    }
  };

  const currentValue = showAllUnits ? 'all' : (selectedUnitId || '');

  return (
    <Select value={currentValue} onValueChange={handleValueChange}>
      <SelectTrigger className="w-36 h-8 text-xs">
        <SelectValue placeholder="Filtrar" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Todas as unidades</SelectItem>
        {units.map((unit) => (
          <SelectItem key={unit.id} value={unit.id}>
            {unit.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default DashboardUnitFilter;
