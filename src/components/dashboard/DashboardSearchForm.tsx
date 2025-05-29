
import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface DashboardSearchFormProps {
  plateSearch: string;
  setPlateSearch: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  unitFilter: {
    showAllUnits: boolean;
    selectedUnitId: string | null;
  };
  isMobile: boolean;
}

const DashboardSearchForm: React.FC<DashboardSearchFormProps> = ({
  plateSearch,
  setPlateSearch,
  onSubmit,
  unitFilter,
  isMobile
}) => {
  return (
    <div className="bg-card border rounded-lg p-4">
      <form onSubmit={onSubmit} className="space-y-3">
        <Label htmlFor="plate-search">Registrar Movimentação</Label>
        <div className="flex w-full items-center space-x-2">
          <Input
            id="plate-search"
            placeholder="BRA2E25"
            value={plateSearch}
            onChange={(e) => setPlateSearch(e.target.value.toUpperCase())}
            className="uppercase"
          />
          <Button type="submit" className="shrink-0" size={isMobile ? "icon" : "default"}>
            <Search className="h-4 w-4" />
            {!isMobile && "Registrar"}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Digite a placa do veículo
          {!unitFilter.showAllUnits && unitFilter.selectedUnitId && 
            ` (apenas veículos da sua unidade podem ser movimentados)`
          }
        </p>
      </form>
    </div>
  );
};

export default DashboardSearchForm;
