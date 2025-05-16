
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
import { format, isValid, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MovementsTableProps {
  movements: Movement[];
  onRowClick?: (movement: Movement) => void;
}

const MovementsTable: React.FC<MovementsTableProps> = ({ movements, onRowClick }) => {
  if (!movements.length) {
    return <div className="text-center py-8 text-muted-foreground">Nenhuma movimentação encontrada</div>;
  }

  // Função para formatar data de forma segura
  const formatDate = (dateString?: string): string => {
    if (!dateString) return '-';
    
    // Verificar se já está no formato dd/mm/yyyy
    if (dateString.includes('/')) return dateString;
    
    try {
      // Tentar converter formato ISO para dd/mm/yyyy
      const dateParts = dateString.split('-');
      if (dateParts.length === 3) {
        return `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
      }
      return dateString;
    } catch (error) {
      console.error("Erro ao formatar data:", error);
      return dateString;
    }
  };

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
                  {formatDate(movement.departureDate)} {movement.departureTime}
                </TableCell>
                <TableCell>
                  {isComplete 
                    ? `${formatDate(movement.arrivalDate)} ${movement.arrivalTime}` 
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
