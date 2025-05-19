
import React from 'react';
import { 
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pencil, Trash2, Building, MapPin } from 'lucide-react';
import { Unit } from '@/types';
import { DeleteUnitDialog } from './DeleteUnitDialog';
import { useState } from 'react';
import { deleteUnit } from '@/services/units/unitService';

interface UnitCardProps {
  unit: Unit;
  onEdit: () => void;
  onDeleted: () => void;
}

const UnitCard: React.FC<UnitCardProps> = ({ unit, onEdit, onDeleted }) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  
  const handleDelete = async () => {
    const success = await deleteUnit(unit.id);
    if (success) {
      onDeleted();
    }
    setIsDeleteDialogOpen(false);
  };

  return (
    <Card className="border-l-4 hover:border-l-4 border-l-primary border-t-0 border-r-0 border-b-0 hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <CardTitle className="flex justify-between items-center">
          <span>{unit.name}</span>
          <span className="text-sm font-medium bg-muted px-2 py-0.5 rounded-sm">
            {unit.code}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="flex flex-col gap-2">
          <div className="flex items-center text-muted-foreground text-sm gap-2">
            <Building className="h-4 w-4" />
            <span>
              Veículos: {unit.vehicleCount || 0}
            </span>
          </div>
          <div className="flex items-center text-muted-foreground text-sm gap-2">
            <MapPin className="h-4 w-4" />
            <span>
              {unit.address || 'Endereço não cadastrado'}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-end gap-2 pt-0">
        <Button 
          variant="ghost" 
          size="icon"
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
          onClick={() => setIsDeleteDialogOpen(true)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onEdit}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </CardFooter>

      <DeleteUnitDialog 
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDelete}
        unitName={unit.name}
      />
    </Card>
  );
};

export default UnitCard;
