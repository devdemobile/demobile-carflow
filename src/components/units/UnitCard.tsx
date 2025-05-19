
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
            <MapPin className="h-4 w-4" />
            <span>
              {unit.address || 'Endereço não cadastrado'}
            </span>
          </div>
          
          <div className="grid grid-cols-3 gap-2 mt-2">
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
            
            <div className="flex items-center text-muted-foreground text-sm gap-1.5">
              <svg 
                className="h-4 w-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <span>
                {unit.movementsCount || 0}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default UnitCard;
