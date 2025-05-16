
import React, { useState } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { Movement, MovementLog, LogActionType } from '@/types';
import { formatMileage } from '@/lib/utils';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { Loader2 } from 'lucide-react';

interface MovementEditDialogProps {
  isOpen: boolean;
  onClose: () => void;
  movement: Movement | null;
  onUpdate: (updatedMovement: Movement) => Promise<void>;
  onDelete: (movement: Movement, password: string) => Promise<void>;
}

interface MovementEditFormData {
  driver: string;
  destination: string;
  initialMileage: number;
  notes?: string;
}

interface DeleteConfirmData {
  password: string;
}

const MovementEditDialog: React.FC<MovementEditDialogProps> = ({
  isOpen,
  onClose,
  movement,
  onUpdate,
  onDelete
}) => {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<MovementEditFormData>();
  const [mileageInput, setMileageInput] = useState('');
  
  // Set initial values when movement changes
  React.useEffect(() => {
    if (movement) {
      setValue('driver', movement.driver);
      setValue('destination', movement.destination || '');
      setValue('initialMileage', movement.initialMileage);
      setValue('notes', movement.notes || '');
      setMileageInput(formatMileage(movement.initialMileage));
    }
  }, [movement, setValue]);

  const handleMileageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numericValue = value.replace(/\D/g, '');
    const mileage = numericValue ? parseInt(numericValue, 10) : 0;
    
    setValue('initialMileage', mileage);
    setMileageInput(formatMileage(mileage));
  };
  
  const handleUpdateSubmit = async (data: MovementEditFormData) => {
    if (!movement) return;
    
    setIsSubmitting(true);
    
    try {
      const updatedMovement: Movement = {
        ...movement,
        driver: data.driver,
        destination: data.destination,
        initialMileage: data.initialMileage,
        notes: data.notes
      };
      
      await onUpdate(updatedMovement);
      toast.success('Movimentação atualizada com sucesso!');
      onClose();
    } catch (error: any) {
      toast.error(`Erro ao atualizar movimentação: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleOpenDeleteDialog = () => {
    setIsDeleteDialogOpen(true);
    setPassword('');
    setPasswordError('');
  };
  
  const handleDeleteConfirm = async () => {
    if (!movement) return;
    if (!password.trim()) {
      setPasswordError('Por favor, digite sua senha para confirmar a exclusão');
      return;
    }
    
    setIsDeleting(true);
    
    try {
      await onDelete(movement, password);
      toast.success('Movimentação excluída com sucesso!');
      setIsDeleteDialogOpen(false);
      onClose();
    } catch (error: any) {
      setPasswordError(error.message || 'Senha incorreta ou problema ao excluir movimentação');
      toast.error(`Erro ao excluir movimentação: ${error.message}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Determine the border color based on movement type
  const borderColorClass = movement?.type === 'exit' ? 'border-amber-500' : 'border-emerald-500';

  if (!movement) return null;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className={`sm:max-w-[500px] ${borderColorClass} border-2`}>
          <DialogHeader>
            <DialogTitle className={movement.type === 'exit' ? 'text-amber-600' : 'text-emerald-600'}>
              Editar Movimentação
            </DialogTitle>
            <DialogDescription>
              {movement.plate} - {movement.vehicleName}
              <span className="block text-muted-foreground text-xs mt-1">
                {movement.departureDate.split('-').reverse().join('/')} às {movement.departureTime}
              </span>
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit(handleUpdateSubmit)} className="space-y-4 py-2">
            <div className="grid gap-3">
              <div>
                <Label htmlFor="driver" className="text-sm">Motorista*</Label>
                <Input
                  id="driver"
                  placeholder="Nome do motorista"
                  {...register('driver', { required: 'Motorista é obrigatório' })}
                />
                {errors.driver && <p className="text-xs text-destructive mt-1">{errors.driver.message}</p>}
              </div>
              
              <div>
                <Label htmlFor="destination" className="text-sm">Destino</Label>
                <Input
                  id="destination"
                  placeholder="Local de destino"
                  {...register('destination')}
                />
              </div>
              
              <div>
                <Label htmlFor="initialMileage" className="text-sm">Quilometragem*</Label>
                <Input
                  id="initialMileage"
                  placeholder="0 km"
                  value={mileageInput}
                  onChange={handleMileageChange}
                />
                {errors.initialMileage && <p className="text-xs text-destructive mt-1">{errors.initialMileage.message}</p>}
              </div>
              
              <div>
                <Label htmlFor="notes" className="text-sm">Observações</Label>
                <Input
                  id="notes"
                  placeholder="Observações adicionais"
                  {...register('notes')}
                />
              </div>
            </div>
            
            <DialogFooter className="pt-2 flex flex-col sm:flex-row gap-2">
              <Button
                type="button"
                variant="destructive"
                onClick={handleOpenDeleteDialog}
              >
                Excluir
              </Button>
              <div className="flex flex-1 justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={onClose}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className={movement.type === 'exit' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : 'Salvar'}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. A exclusão será registrada no log do sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="py-4">
            <Label htmlFor="delete-password" className="text-sm">Digite sua senha para confirmar*</Label>
            <Input
              id="delete-password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setPasswordError('');
              }}
              className="mt-2"
              placeholder="Sua senha"
            />
            {passwordError && <p className="text-xs text-destructive mt-1">{passwordError}</p>}
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleDeleteConfirm();
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Excluindo...
                </>
              ) : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default MovementEditDialog;
