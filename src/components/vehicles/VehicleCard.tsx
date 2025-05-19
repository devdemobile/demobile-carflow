
import React from 'react';
import { Vehicle } from '@/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Car } from 'lucide-react';

interface VehicleCardProps {
  vehicle: Vehicle;
  onClick: (vehicle: Vehicle) => void;
}

const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, onClick }) => {
  const getLocationLabel = (location: string) => {
    switch (location) {
      case 'yard': return 'No Pátio';
      case 'out': return 'Em Rota';
      default: return location;
    }
  };

  const getBorderClass = (location: string) => {
    switch (location) {
      case 'yard': return 'border-green-500';
      case 'out': return 'border-amber-500';
      default: return 'border-gray-300';
    }
  };

  // Vehicle name with make, model, and color in a single line
  const vehicleFullName = `${vehicle.make} ${vehicle.model} ${vehicle.color}`;

  return (
    <Card 
      className={`cursor-pointer hover:shadow-md transition-shadow border-l-4 ${getBorderClass(vehicle.location)}`}
      onClick={() => onClick(vehicle)}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold">{vehicle.plate}</CardTitle>
            <CardDescription className="font-medium">
              {vehicleFullName}
            </CardDescription>
          </div>
          <Badge variant={vehicle.location === 'yard' ? 'outline' : 'secondary'}>
            {getLocationLabel(vehicle.location)}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="grid gap-1 text-sm">
        <div className="flex items-center gap-2">
          <Car className="h-3 w-3 text-muted-foreground" />
          <span>
            {vehicleFullName}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-3 w-3 text-muted-foreground" />
          <span>
            {vehicle.location === 'yard' ? 'No Pátio' : 'Em Rota'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default VehicleCard;
