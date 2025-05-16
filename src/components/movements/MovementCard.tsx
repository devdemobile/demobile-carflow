
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Movement } from '@/types';
import { ArrowRight, Warehouse, Navigation } from 'lucide-react';
import { formatMileage } from '@/lib/utils';

interface MovementCardProps {
  movement: Movement;
  onClick?: () => void;
}

const MovementCard: React.FC<MovementCardProps> = ({ movement, onClick }) => {
  const isComplete = movement.arrivalDate && movement.arrivalTime;
  const statusClass = movement.status === 'yard' ? 'card-status-yard' : 'card-status-out';
  const StatusIcon = movement.status === 'yard' ? Warehouse : Navigation;
  
  return (
    <Card 
      className={`overflow-hidden hover:shadow-md transition-shadow ${statusClass} cursor-pointer`}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold">{movement.plate}</h3>
          <div className="flex items-center">
            <StatusIcon className="h-3 w-3 mr-1" />
            <span className={movement.status === 'yard' ? 'text-yard' : 'text-out'}>
              {movement.status === 'yard' ? 'Completado' : 'Em Andamento'}
            </span>
          </div>
        </div>
        
        <p className="text-sm text-muted-foreground mb-3 truncate">
          {movement.vehicleName}
        </p>
        
        <div className="text-sm mb-2">
          <p className="font-medium">Motorista: {movement.driver}</p>
          {movement.destination && (
            <p className="text-muted-foreground truncate">Destino: {movement.destination}</p>
          )}
        </div>
        
        <div className="flex items-center justify-between text-xs mt-4">
          <div className="flex flex-col">
            <span className="text-muted-foreground">Saída</span>
            <span>{movement.departureDate.split('-').reverse().join('/')} {movement.departureTime}</span>
          </div>
          
          <ArrowRight className="h-4 w-4 text-muted-foreground mx-2" />
          
          <div className="flex flex-col">
            <span className="text-muted-foreground">Chegada</span>
            <span>
              {isComplete 
                ? `${movement.arrivalDate?.split('-').reverse().join('/')} ${movement.arrivalTime}` 
                : "-"}
            </span>
          </div>
        </div>
        
        {isComplete && movement.mileageRun && (
          <div className="mt-2 text-xs flex justify-between">
            <span>{formatMileage(movement.mileageRun)} km percorridos</span>
            <span>{movement.duration}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MovementCard;
