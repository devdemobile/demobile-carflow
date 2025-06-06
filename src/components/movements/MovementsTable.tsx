
import React from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Movement } from '@/types';
import { Badge } from '@/components/ui/badge';
import { formatDateForDisplay, formatTimeForDisplay } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface MovementsTableProps {
  movements: Movement[];
  isLoading?: boolean;
  onRowClick: (movement: Movement) => void;
  showUnits?: boolean;
  onMovementClick?: (movement: Movement) => void; // Compatibilidade
}

const MovementsTable: React.FC<MovementsTableProps> = ({ 
  movements, 
  isLoading = false,
  onRowClick,
  onMovementClick, // Aceita a nova prop
  showUnits = false
}) => {
  // Usa onMovementClick se fornecido, caso contrário usa onRowClick
  const handleRowClick = onMovementClick || onRowClick;
  
  // Função para determinar a variante do badge baseado no status
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'yard': return 'success';
      case 'out': return 'warning';
      default: return 'default';
    }
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="w-full h-16 flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!movements || movements.length === 0) {
    return (
      <div className="text-center p-4 bg-background border rounded-md text-muted-foreground">
        Nenhuma movimentação encontrada
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Veículo</TableHead>
            {showUnits && <TableHead>Origem</TableHead>}
            <TableHead>Saída</TableHead>
            {showUnits && <TableHead>Destino</TableHead>}
            <TableHead>Chegada</TableHead>
            <TableHead>Motorista</TableHead>
            <TableHead>Km Inicial</TableHead>
            <TableHead>Km Final</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {movements.map((movement) => (
            <TableRow 
              key={movement.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => handleRowClick(movement)}
            >
              <TableCell className="font-medium">
                <div className="flex items-center gap-2">
                  {/* Miniatura do veículo */}
                  <div className="w-8 h-8 rounded-md overflow-hidden bg-muted flex-shrink-0">
                    <img 
                      src={movement.photoUrl || '/placeholder.svg'} 
                      alt={`Veículo ${movement.vehiclePlate || movement.vehicleId}`} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }}
                    />
                  </div>
                  {movement.vehiclePlate || movement.vehicleId}
                </div>
              </TableCell>
              
              {showUnits && (
                <TableCell>
                  {movement.departureUnitName || "—"}
                </TableCell>
              )}
              
              <TableCell>
                {movement.departureDate ? (
                  <div className="flex flex-col">
                    <span>{formatDateForDisplay(movement.departureDate)}</span>
                    <span className="text-xs text-muted-foreground">{formatTimeForDisplay(movement.departureTime)}</span>
                  </div>
                ) : "—"}
              </TableCell>
              
              {showUnits && (
                <TableCell>
                  {movement.arrivalUnitName || movement.destination || "—"}
                </TableCell>
              )}
              
              <TableCell>
                {movement.arrivalDate ? (
                  <div className="flex flex-col">
                    <span>{formatDateForDisplay(movement.arrivalDate)}</span>
                    <span className="text-xs text-muted-foreground">{formatTimeForDisplay(movement.arrivalTime)}</span>
                  </div>
                ) : "—"}
              </TableCell>
              
              <TableCell>{movement.driver}</TableCell>
              
              <TableCell>{movement.initialMileage?.toLocaleString()}</TableCell>
              
              <TableCell>{movement.finalMileage?.toLocaleString() || "—"}</TableCell>
              
              <TableCell>
                <Badge 
                  variant={getStatusVariant(movement.status)}
                >
                  {movement.status === 'yard' ? 'No pátio' : 
                   movement.status === 'out' ? 'Em rota' : 
                   movement.status}
                </Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default MovementsTable;
