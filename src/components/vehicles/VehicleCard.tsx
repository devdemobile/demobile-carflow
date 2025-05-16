
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Vehicle } from '@/types';
import { Car, Warehouse, Navigation } from 'lucide-react';
import { formatMileage } from '@/lib/utils';

interface VehicleCardProps {
  vehicle: Vehicle;
  onClick: (vehicle: Vehicle) => void;
}

const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, onClick }) => {
  const handleClick = () => {
    onClick(vehicle);
  };
  
  const LocationIcon = vehicle.location === 'yard' ? Warehouse : Navigation;

  return (
    <div 
      className="bg-card border rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer"
      onClick={handleClick}
    >
      <div className="aspect-[16/9] relative bg-muted">
        {vehicle.photoUrl ? (
          <img 
            src={vehicle.photoUrl} 
            alt={`${vehicle.make} ${vehicle.model}`} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Car className="h-16 w-16 text-muted-foreground opacity-50" />
          </div>
        )}
        
        <Badge 
          className={`absolute top-2 right-2 ${
            vehicle.location === 'yard' 
              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' 
              : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
          }`}
        >
          <LocationIcon className="h-3 w-3 mr-1" />
          {vehicle.location === 'yard' ? 'No Pátio' : 'Em Uso'}
        </Badge>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold truncate">{vehicle.plate}</h3>
          <span className="text-sm text-muted-foreground">{vehicle.year}</span>
        </div>
        
        <p className="text-sm text-muted-foreground line-clamp-1">
          {vehicle.make} {vehicle.model}
        </p>
        
        <div className="flex justify-between mt-4 text-sm">
          <span className="text-muted-foreground">{vehicle.color}</span>
          <span className="font-medium">{formatMileage(vehicle.mileage)} km</span>
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;
