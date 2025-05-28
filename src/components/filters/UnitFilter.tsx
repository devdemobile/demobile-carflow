
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/useAuth';
import { useUnits } from '@/hooks/useUnits';

interface UnitFilterProps {
  selectedUnitId: string | null;
  showAllUnits: boolean;
  onUnitChange: (unitId: string | null) => void;
  onShowAllChange: (showAll: boolean) => void;
  label?: string;
}

const UnitFilter: React.FC<UnitFilterProps> = ({
  selectedUnitId,
  showAllUnits,
  onUnitChange,
  onShowAllChange,
  label = "Filtro por Unidade"
}) => {
  const { user } = useAuth();
  const { units } = useUnits();

  // Se for admin, sempre mostra o filtro
  // Se for operador, só mostra se tiver permissão para ver outras unidades
  const shouldShowFilter = user?.role === 'admin' || user?.permissions?.canViewUnits;

  if (!shouldShowFilter) {
    return null;
  }

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">{label}</Label>
      
      <div className="flex items-center space-x-2">
        <Switch
          id="show-all-units"
          checked={showAllUnits}
          onCheckedChange={onShowAllChange}
        />
        <Label htmlFor="show-all-units" className="text-sm">
          Mostrar todas as unidades
        </Label>
      </div>

      {!showAllUnits && (
        <Select
          value={selectedUnitId || ''}
          onValueChange={(value) => onUnitChange(value || null)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma unidade" />
          </SelectTrigger>
          <SelectContent>
            {units.map((unit) => (
              <SelectItem key={unit.id} value={unit.id}>
                {unit.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {selectedUnitId && !showAllUnits && (
        <p className="text-xs text-muted-foreground">
          Exibindo dados da unidade: {units.find(u => u.id === selectedUnitId)?.name}
        </p>
      )}

      {showAllUnits && (
        <p className="text-xs text-muted-foreground">
          Exibindo dados de todas as unidades
        </p>
      )}
    </div>
  );
};

export default UnitFilter;
