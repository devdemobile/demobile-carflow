
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Vehicle } from '@/types';

interface VehicleCardProps {
  vehicle: Vehicle & { frequency?: number };
  onClick?: () => void;
}

const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, onClick }) => {
  const statusClass = vehicle.location === 'yard' ? 'card-status-yard' : 'card-status-out';
  const statusBadge = vehicle.location === 'yard' ? 'status-badge-yard' : 'status-badge-out';
  const statusText = vehicle.location === 'yard' ? 'No Pátio' : 'Fora';
  
  return (
    <Card 
      className={`overflow-hidden hover:shadow-md transition-shadow ${statusClass} cursor-pointer`}
      onClick={onClick}
    >
      <div className="relative">
        <span className={statusBadge}>{statusText}</span>
        
        <div className="h-40 bg-muted flex items-center justify-center overflow-hidden">
          {vehicle.photoUrl ? (
            <img 
              src={vehicle.photoUrl} 
              alt={`${vehicle.make} ${vehicle.model}`} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-4xl text-muted-foreground">
              <span className="font-bold">{vehicle.plate}</span>
            </div>
          )}
        </div>
      </div>
      
      <CardContent className="p-4">
        <h3 className="font-bold text-lg mb-1">{vehicle.plate}</h3>
        <p className="text-sm text-muted-foreground mb-2">
          {vehicle.make} {vehicle.model} {vehicle.color} {vehicle.year}
        </p>
        <div className="flex justify-between items-center text-xs">
          <span className="bg-secondary px-2 py-1 rounded-full">
            {vehicle.mileage.toLocaleString()} km
          </span>
          
          {vehicle.frequency !== undefined && (
            <span className="text-xs text-muted-foreground">
              {vehicle.frequency} movimentos
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default VehicleCard;
