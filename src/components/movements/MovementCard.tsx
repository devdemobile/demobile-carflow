
import React from 'react';
import { Movement } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDateForDisplay, formatTimeForDisplay } from '@/lib/utils';
import { ArrowRight, MapPin, Car } from 'lucide-react';

interface MovementCardProps {
  movement: Movement;
  onClick: (movement: Movement) => void;
}

const MovementCard: React.FC<MovementCardProps> = ({ movement, onClick }) => {
  const getMovementTypeLabel = (type: string) => {
    switch (type) {
      case 'exit': return 'Saída';
      case 'entry': return 'Entrada';
      case 'initial': return 'Registro Inicial';
      default: return type;
    }
  };

  const getMovementStatusLabel = (status: string) => {
    switch (status) {
      case 'yard': return 'No Pátio';
      case 'out': return 'Em Rota';
      default: return status;
    }
  };

  const mileageText = movement.finalMileage 
    ? `${movement.initialMileage.toLocaleString()} → ${movement.finalMileage.toLocaleString()} km`
    : `${movement.initialMileage.toLocaleString()} km`;

  return (
    <Card 
      className="cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onClick(movement)}
    >
      <CardContent className="pt-6">
        <div className="flex justify-between items-start mb-3">
          <div className="flex flex-col">
            <span className="text-lg font-medium">{movement.vehiclePlate || movement.vehicleId}</span>
            <span className="text-sm text-muted-foreground">{movement.driver}</span>
          </div>
          <div className="flex gap-2">
            <Badge>{getMovementTypeLabel(movement.type)}</Badge>
            <Badge variant="outline">{getMovementStatusLabel(movement.status)}</Badge>
          </div>
        </div>
        
        <div className="flex flex-col gap-1 text-sm mb-4">
          <div className="flex items-center gap-1 text-muted-foreground">
            <Car className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">{mileageText}</span>
          </div>
          
          <div className="flex items-center gap-3 mt-3">
            <div className="flex flex-col flex-1">
              <div className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                <span className="font-medium">Origem</span>
              </div>
              <span className="text-xs text-muted-foreground truncate">
                {movement.departureUnitName || "—"}
              </span>
            </div>
            
            <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            
            <div className="flex flex-col flex-1">
              <div className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5 text-destructive" />
                <span className="font-medium">Destino</span>
              </div>
              <span className="text-xs text-muted-foreground truncate">
                {movement.arrivalUnitName || movement.destination || "—"}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex justify-between border-t pt-2 text-xs text-muted-foreground">
          <div>
            {movement.departureDate && (
              <div>
                <span>Saída: </span>
                <span>{formatDateForDisplay(movement.departureDate)}</span>
                <span className="ml-1">{formatTimeForDisplay(movement.departureTime)}</span>
              </div>
            )}
          </div>
          <div>
            {movement.arrivalDate && (
              <div>
                <span>Chegada: </span>
                <span>{formatDateForDisplay(movement.arrivalDate)}</span>
                <span className="ml-1">{formatTimeForDisplay(movement.arrivalTime || "")}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MovementCard;
