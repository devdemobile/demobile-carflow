
import React from 'react';
import { 
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from '@/components/ui/card';
import { MapPin, Users, TruckIcon } from 'lucide-react';
import { Unit } from '@/types';

interface UnitCardProps {
  unit: Unit;
  onClick: () => void;
}

const UnitCard: React.FC<UnitCardProps> = ({ unit, onClick }) => {
  return (
    <Card 
      className="border-l-4 hover:border-l-4 border-l-primary border-t-0 border-r-0 border-b-0 hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2">
          <span className="text-sm font-medium bg-muted px-2 py-0.5 rounded-sm">
            {unit.code}
          </span>
          <span>{unit.name}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="flex flex-col gap-2">
          <div className="flex items-center text-muted-foreground text-sm gap-2">
            <MapPin className="h-4 w-4" />
            <span>
              {unit.address || 'Endereço não cadastrado'}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="flex items-center text-muted-foreground text-sm gap-1.5">
              <TruckIcon className="h-4 w-4" />
              <span>
                {unit.vehicleCount || 0}
              </span>
            </div>
            
            <div className="flex items-center text-muted-foreground text-sm gap-1.5">
              <Users className="h-4 w-4" />
              <span>
                {unit.usersCount || 0}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UnitCard;
