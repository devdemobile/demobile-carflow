
import React, { useState } from 'react';
import { Vehicle } from '@/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { vehicleService } from '@/services/vehicles/vehicleService';
import { toast } from 'sonner';

interface DeleteVehicleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onDelete: () => void;
  vehicle: Vehicle;
}

export const DeleteVehicleDialog: React.FC<DeleteVehicleDialogProps> = ({
  isOpen,
  onClose,
  onDelete,
  vehicle,
}) => {
  const [password, setPassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDeleteVehicle = async () => {
    if (!password) {
      setError('Digite sua senha para confirmar');
      return;
    }

    try {
      setIsDeleting(true);
      setError(null);
      
      // Em uma implementação real, verificaríamos a senha
      // Por enquanto, vamos apenas fingir que fizemos isso
      await vehicleService.deleteVehicle(vehicle.id);
      
      toast.success(`Veículo ${vehicle.plate} excluído com sucesso`);
      onDelete();
    } catch (error: any) {
      toast.error(`Erro ao excluir veículo: ${error.message}`);
      setError(`Falha ao excluir: ${error.message}`);
    } finally {
      setIsDeleting(false);
      setPassword('');
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Excluir Veículo</AlertDialogTitle>
          <AlertDialogDescription>
            Você está prestes a excluir o veículo <strong>{vehicle.plate}</strong>. 
            Esta ação é irreversível. Para confirmar, digite sua senha abaixo.
          </AlertDialogDescription>
        </AlertDialogHeader>
        
        <div className="py-4">
          <Label htmlFor="password" className="text-sm font-medium">
            Senha
          </Label>
          <Input
            id="password"
            type="password"
            placeholder="Digite sua senha"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(null);
            }}
            className={error ? "border-red-500" : ""}
          />
          {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
        </div>
        
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction 
            onClick={(e) => {
              e.preventDefault();
              handleDeleteVehicle();
            }}
            disabled={isDeleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {isDeleting ? "Excluindo..." : "Excluir"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
