
import React from 'react';
import { Vehicle } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface VehiclesTableProps {
  vehicles: Vehicle[];
  onVehicleClick?: (vehicle: Vehicle) => void;
}

const VehiclesTable: React.FC<VehiclesTableProps> = ({ vehicles, onVehicleClick }) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Placa</TableHead>
            <TableHead className="hidden md:table-cell">Veículo</TableHead>
            <TableHead className="hidden lg:table-cell">Cor</TableHead>
            <TableHead className="hidden lg:table-cell">Ano</TableHead>
            <TableHead>Quilometragem</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vehicles.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                Nenhum veículo encontrado.
              </TableCell>
            </TableRow>
          ) : (
            vehicles.map((vehicle) => (
              <TableRow 
                key={vehicle.id}
                className="cursor-pointer hover:bg-muted"
                onClick={() => onVehicleClick && onVehicleClick(vehicle)}
              >
                <TableCell className="font-medium">{vehicle.plate}</TableCell>
                <TableCell className="hidden md:table-cell">
                  {vehicle.make} {vehicle.model}
                </TableCell>
                <TableCell className="hidden lg:table-cell">{vehicle.color}</TableCell>
                <TableCell className="hidden lg:table-cell">{vehicle.year}</TableCell>
                <TableCell>{vehicle.mileage.toLocaleString()} km</TableCell>
                <TableCell>
                  <Badge variant={vehicle.location === 'yard' ? 'outline' : 'secondary'}>
                    {vehicle.location === 'yard' ? 'No Pátio' : 'Em Uso'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default VehiclesTable;
