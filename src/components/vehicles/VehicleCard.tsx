
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Vehicle } from '@/types';
import { Car, Warehouse, Navigation, MapPin } from 'lucide-react';
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
  const borderClass = vehicle.location === 'yard' ? 'border-l-4 border-l-yard' : 'border-l-4 border-l-out';

  // Get the location display text
  const getLocationDisplay = () => {
    if (vehicle.location === 'yard') {
      return vehicle.unitName || 'Sem unidade';
    } else {
      // Get destination from most recent exit movement (would be implemented in a real app)
      return 'Em rota';
    }
  };

  return (
    <div 
      className={`bg-card border rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer ${borderClass}`}
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
        
        <div className="flex justify-between mt-2 items-center text-sm">
          <div className="flex items-center">
            <MapPin className="h-3 w-3 mr-1 text-muted-foreground" />
            <span className="text-muted-foreground line-clamp-1">{getLocationDisplay()}</span>
          </div>
          <span className="font-medium">{formatMileage(vehicle.mileage)} km</span>
        </div>
        
        <div className="mt-2 text-sm">
          <span className="text-muted-foreground">{vehicle.color}</span>
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;
