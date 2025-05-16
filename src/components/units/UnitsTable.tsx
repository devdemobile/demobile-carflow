
import React from 'react';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { Unit } from "@/types";

interface UnitsTableProps {
  units: Unit[];
  onEdit: (unit: Unit) => void;
  onDelete: (unit: Unit) => void;
  onViewDetails: (unit: Unit) => void;
}

export const UnitsTable: React.FC<UnitsTableProps> = ({ 
  units, 
  onEdit, 
  onDelete, 
  onViewDetails 
}) => {
  if (units.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Nenhuma unidade encontrada</p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Código</TableHead>
            <TableHead>Endereço</TableHead>
            <TableHead>Veículos</TableHead>
            <TableHead>Usuários</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {units.map((unit) => (
            <TableRow 
              key={unit.id}
              className="cursor-pointer hover:bg-muted/60"
              onClick={() => onViewDetails(unit)}
            >
              <TableCell className="font-medium">{unit.name}</TableCell>
              <TableCell>{unit.code}</TableCell>
              <TableCell>{unit.address || 'Não informado'}</TableCell>
              <TableCell>{unit.vehicleCount}</TableCell>
              <TableCell>{unit.usersCount}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={(e) => {
                    e.stopPropagation(); // Previne que o evento de clique propague para a linha
                    onDelete(unit);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation(); // Previne que o evento de clique propague para a linha
                    onEdit(unit);
                  }}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
