
import { useForm } from 'react-hook-form';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { VehicleMake } from '@/types';
import { useEffect } from 'react';

interface MakeFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string) => void;
  isLoading: boolean;
  editingMake?: VehicleMake | null;
  initialValue?: string;
}

const MakeForm: React.FC<MakeFormProps> = ({
  isOpen,
  onClose,
  onSave,
  isLoading,
  editingMake,
  initialValue
}) => {
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<{ name: string }>({
    defaultValues: {
      name: editingMake?.name || initialValue || ''
    }
  });

  useEffect(() => {
    if (isOpen) {
      // Set the initial value when the modal opens
      if (editingMake) {
        setValue('name', editingMake.name);
      } else if (initialValue) {
        setValue('name', initialValue);
      }
    }
  }, [isOpen, editingMake, initialValue, setValue]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSave = (data: { name: string }) => {
    onSave(data.name);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editingMake ? 'Editar Marca' : 'Nova Marca'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(handleSave)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nome da Marca</Label>
            <Input
              id="name"
              placeholder="Ex: Ford, Chevrolet, etc."
              {...register('name', { 
                required: 'Nome da marca é obrigatório',
                minLength: {
                  value: 2,
                  message: 'Nome deve ter pelo menos 2 caracteres'
                }
              })}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default MakeForm;
