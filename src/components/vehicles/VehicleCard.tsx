
import React from 'react';
import { Vehicle } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Car } from 'lucide-react';
import { cn } from '@/lib/utils';

interface VehicleCardProps {
  vehicle: Vehicle;
  onClick: (vehicle: Vehicle) => void;
  compact?: boolean; // Propriedade para card compacto
}

const VehicleCard: React.FC<VehicleCardProps> = ({ vehicle, onClick, compact = false }) => {
  const getLocationLabel = (location: string) => {
    switch (location) {
      case 'yard': return 'No Pátio';
      case 'out': return 'Em Rota';
      default: return location;
    }
  };

  const getBorderClass = (location: string) => {
    switch (location) {
      case 'yard': return 'border-l-4 border-l-green-500';
      case 'out': return 'border-l-4 border-l-amber-500';
      default: return 'border-l-4 border-l-gray-300';
    }
  };

  const getBadgeVariant = (location: string) => {
    switch (location) {
      case 'yard': return 'success';
      case 'out': return 'warning';
      default: return 'outline';
    }
  };

  // Vehicle name with make, model, and color in a single line
  const vehicleFullName = `${vehicle.make} ${vehicle.model} ${vehicle.color}`;

  // Placeholder image if no photo is available
  const placeholderImage = "/placeholder.svg";
  
  return (
    <Card 
      className={`cursor-pointer hover:shadow-md transition-shadow h-full ${getBorderClass(vehicle.location)}`}
      onClick={() => onClick(vehicle)}
    >
      <div className={cn(
        "overflow-hidden bg-muted relative", // Adicionado relative para posicionar a badge
        compact ? "aspect-[16/9]" : "aspect-video" // Diminuindo a altura da imagem quando compacto
      )}>
        <img
          src={vehicle.photoUrl || placeholderImage}
          alt={vehicle.plate}
          className="h-full w-full object-cover"
          onError={(e) => {
            e.currentTarget.src = placeholderImage;
          }}
        />
        <Badge 
          variant={getBadgeVariant(vehicle.location)}
          className="absolute top-2 right-2 text-xs"
        >
          {getLocationLabel(vehicle.location)}
        </Badge>
      </div>
      
      <CardHeader className={cn("pb-2", compact && "p-3 pt-2")}>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className={cn("font-bold", compact ? "text-base" : "text-xl")}>
              {vehicle.plate}
            </CardTitle>
            <CardDescription className="font-medium">
              {vehicleFullName}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className={cn("grid gap-1 text-sm", compact && "p-3 pt-0")}>
        {!compact && (
          <div className="flex items-center gap-2">
            <Car className="h-3 w-3 text-muted-foreground" />
            <span>
              {vehicleFullName}
            </span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <MapPin className="h-3 w-3 text-muted-foreground" />
          <span>
            {vehicle.location === 'yard' 
              ? `Unidade: ${vehicle.unitName || 'Principal'}` 
              : `Destino: ${vehicle.destination || 'Não informado'}`}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default VehicleCard;
