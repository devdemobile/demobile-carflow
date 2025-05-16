
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Vehicle } from '@/types';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';

interface VehicleCardProps {
  vehicle: Vehicle;
  onClick?: (vehicle: Vehicle) => void;
}

const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, onClick }) => {
  const statusClasses = {
    yard: "border-l-4 border-emerald-500",
    out: "border-l-4 border-amber-500"
  };
  
  const statusBadgeClasses = {
    yard: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200",
    out: "bg-amber-100 text-amber-800 hover:bg-amber-200"
  };
  
  return (
    <Card 
      className={`overflow-hidden hover:shadow-md transition-shadow cursor-pointer ${statusClasses[vehicle.location]}`}
      onClick={() => onClick && onClick(vehicle)}
    >
      <div className="relative">
        <Badge 
          className={`absolute top-2 right-2 z-10 ${statusBadgeClasses[vehicle.location]}`}
        >
          <MapPin className="h-3 w-3 mr-1" />
          {vehicle.location === 'yard' ? 'No Pátio' : 'Em Uso'}
        </Badge>
        
        <div className="h-40 bg-muted flex items-center justify-center overflow-hidden">
          {vehicle.photoUrl ? (
            <img 
              src={vehicle.photoUrl} 
              alt={`${vehicle.make} ${vehicle.model}`} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-4xl text-muted-foreground flex flex-col items-center">
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
          <span className="text-xs text-muted-foreground">
            {vehicle.unitName || vehicle.unitId}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default VehicleCard;
