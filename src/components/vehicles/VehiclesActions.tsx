
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Tag, Cog } from 'lucide-react';

interface VehiclesActionsProps {
  userPermissions: any;
  isMobile: boolean;
  onOpenMakes: () => void;
  onOpenModels: () => void;
  onOpenAddVehicle: () => void;
}

const VehiclesActions: React.FC<VehiclesActionsProps> = ({
  userPermissions,
  isMobile,
  onOpenMakes,
  onOpenModels,
  onOpenAddVehicle
}) => {
  if (!userPermissions?.canEditVehicles) {
    return null;
  }

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onOpenMakes}
        aria-label="Gerenciar marcas"
      >
        <Tag className="h-4 w-4" />
        {!isMobile && <span className="ml-1">Marcas</span>}
      </Button>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onOpenModels}
        aria-label="Gerenciar modelos"
      >
        <Cog className="h-4 w-4" />
        {!isMobile && <span className="ml-1">Modelos</span>}
      </Button>
      <Button onClick={onOpenAddVehicle}>
        <Plus className="h-4 w-4" />
        {!isMobile && <span className="ml-2">Novo Veículo</span>}
      </Button>
    </>
  );
};

export default VehiclesActions;
