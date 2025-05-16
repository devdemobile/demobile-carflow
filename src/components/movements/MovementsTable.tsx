
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
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowRight } from 'lucide-react';

interface MovementsTableProps {
  movements: Movement[];
  onRowClick?: (movement: Movement) => void;
}

const MovementsTable: React.FC<MovementsTableProps> = ({ movements, onRowClick }) => {
  if (!movements.length) {
    return <div className="text-center py-8 text-muted-foreground">Nenhuma movimentação encontrada</div>;
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Placa</TableHead>
            <TableHead>Veículo</TableHead>
            <TableHead>Motorista</TableHead>
            <TableHead>Destino</TableHead>
            <TableHead>Saída</TableHead>
            <TableHead>Chegada</TableHead>
            <TableHead className="text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {movements.map((movement) => {
            const isComplete = movement.arrivalDate && movement.arrivalTime;
            
            return (
              <TableRow 
                key={movement.id}
                onClick={() => onRowClick?.(movement)}
                className="cursor-pointer hover:bg-muted/60"
              >
                <TableCell className="font-medium">{movement.plate}</TableCell>
                <TableCell>{movement.vehicleName}</TableCell>
                <TableCell>{movement.driver}</TableCell>
                <TableCell>{movement.destination || '-'}</TableCell>
                <TableCell>
                  {movement.departureDate.split('-').reverse().join('/')} {movement.departureTime}
                </TableCell>
                <TableCell>
                  {isComplete 
                    ? `${movement.arrivalDate?.split('-').reverse().join('/')} ${movement.arrivalTime}` 
                    : '-'}
                </TableCell>
                <TableCell className="text-right">
                  <span className={movement.status === 'yard' ? 'text-green-600' : 'text-amber-600'}>
                    {movement.status === 'yard' ? 'Completado' : 'Em Andamento'}
                  </span>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default MovementsTable;
