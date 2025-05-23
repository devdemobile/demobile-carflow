
import React from 'react';
import { Movement } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDateForDisplay, formatTimeForDisplay } from '@/lib/utils';
import { ArrowRight, MapPin, Car, Clock, User } from 'lucide-react';
import { cn } from '@/lib/utils';

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

  // Determina a cor da borda baseada no status
  const getBorderClass = (status: string) => {
    switch (status) {
      case 'yard': return 'border-l-4 border-l-green-500'; 
      case 'out': return 'border-l-4 border-l-amber-500';
      default: return 'border-l-4 border-l-gray-300';
    }
  };

  // Determina a variante da tag baseada no status
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'yard': return 'success';
      case 'out': return 'warning';
      default: return 'outline';
    }
  };

  // Calcular quilometragem percorrida
  const mileageRun = movement.finalMileage && movement.initialMileage 
    ? movement.finalMileage - movement.initialMileage 
    : movement.mileageRun || 0;

  // Formatar quilometragem atual como string
  const initialMileageFormatted = movement.initialMileage?.toLocaleString() || '0';
  const finalMileageFormatted = movement.finalMileage?.toLocaleString() || '—';
  
  // Imagem do veículo
  const vehicleImageUrl = movement.photoUrl || '/placeholder.svg';
  
  return (
    <Card 
      className={`cursor-pointer hover:shadow-md transition-shadow h-full ${getBorderClass(movement.status)}`}
      onClick={() => onClick(movement)}
    >
      <CardContent className="pt-4"> {/* Reduzido o padding top */}
        {/* Cabeçalho: Placa e Status - Layout mais compacto */}
        <div className="flex justify-between items-center mb-2"> {/* Menor margem */}
          <div className="flex gap-2 items-center"> {/* Gap menor */}
            {/* Miniatura do veículo - Tamanho reduzido */}
            <div className="w-12 h-12 rounded-md overflow-hidden bg-muted flex-shrink-0"> {/* Tamanho reduzido */}
              <img 
                src={vehicleImageUrl} 
                alt={`Veículo ${movement.vehiclePlate || movement.plate || movement.vehicleId}`} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder.svg';
                }}
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold">{movement.vehiclePlate || movement.plate || movement.vehicleId}</span> {/* Tamanho de fonte menor */}
                <Badge variant={getStatusVariant(movement.status)} className="ml-1">
                  {getMovementStatusLabel(movement.status)}
                </Badge>
              </div>
              {/* Informação completa do veículo incluindo a cor */}
              <span className="text-xs text-muted-foreground">{movement.vehicleName || ''}</span> {/* Texto menor */}
            </div>
          </div>
        </div>
        
        {/* Motorista */}
        <div className="flex items-center gap-2 mb-3"> {/* Menor margem */}
          <User className="h-3 w-3 text-muted-foreground" /> {/* Ícone menor */}
          <span className="text-xs">Motorista: <span className="font-medium">{movement.driver}</span></span> {/* Texto menor */}
        </div>
        
        {/* Origem e Destino */}
        <div className="flex items-center justify-between gap-2 mb-3"> {/* Menor margem */}
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-muted-foreground">Origem</span>
            <span className="text-xs">{movement.departureUnitName || "—"}</span> {/* Texto menor */}
          </div>
          
          <ArrowRight className="h-3 w-3 text-muted-foreground" /> {/* Ícone menor */}
          
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-muted-foreground">Destino</span>
            <span className="text-xs">{movement.destination || "—"}</span> {/* Texto menor */}
          </div>
        </div>
        
        {/* Detalhes de Saída e Chegada */}
        <div className="grid grid-cols-2 gap-2 mb-2"> {/* Gap e margem menores */}
          {/* Detalhes de Saída */}
          <div className="bg-muted/40 p-1.5 rounded-md"> {/* Padding menor */}
            <p className="text-xs font-semibold text-muted-foreground mb-1">Saída</p>
            {movement.departureDate && (
              <>
                <p className="text-xs">
                  {formatDateForDisplay(movement.departureDate)} {formatTimeForDisplay(movement.departureTime)}
                </p>
                <p className="text-xs text-muted-foreground">{movement.departureUnitName}</p>
                <p className="text-xs">KM: {initialMileageFormatted}</p>
              </>
            )}
          </div>
          
          {/* Detalhes de Chegada */}
          <div className="bg-muted/40 p-1.5 rounded-md"> {/* Padding menor */}
            <p className="text-xs font-semibold text-muted-foreground mb-1">Chegada</p>
            {movement.arrivalDate ? (
              <>
                <p className="text-xs">
                  {formatDateForDisplay(movement.arrivalDate)} {formatTimeForDisplay(movement.arrivalTime || "")}
                </p>
                <p className="text-xs text-muted-foreground">{movement.arrivalUnitName || "—"}</p>
                <p className="text-xs">KM: {finalMileageFormatted}</p>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">—</p>
            )}
          </div>
        </div>
        
        {/* Rodapé: Duração e Distância */}
        {(movement.duration || mileageRun > 0) && (
          <div className="border-t pt-1.5 text-xs"> {/* Padding menor */}
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span>
                Duração: {movement.duration || "—"} 
                {mileageRun > 0 && ` - ${mileageRun} km percorridos`}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MovementCard;
