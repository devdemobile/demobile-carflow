
import { useEffect } from 'react';
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
import { VehicleModel } from '@/types';
import { useVehicleMakes } from '@/hooks/useVehicleMakes';
import { Combobox } from '@/components/ui/combobox';

interface ModelFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; makeId: string }) => void;
  isLoading: boolean;
  editingModel?: VehicleModel | null;
  defaultMakeId?: string;
}

const ModelForm: React.FC<ModelFormProps> = ({
  isOpen,
  onClose,
  onSave,
  isLoading,
  editingModel,
  defaultMakeId
}) => {
  const { makes } = useVehicleMakes();
  
  const { register, handleSubmit, formState: { errors }, setValue, watch, reset } = useForm<{ 
    name: string;
    makeId: string;
  }>({
    defaultValues: {
      name: editingModel?.name || '',
      makeId: editingModel?.makeId || defaultMakeId || ''
    }
  });

  useEffect(() => {
    if (editingModel) {
      setValue('name', editingModel.name);
      setValue('makeId', editingModel.makeId);
    } else if (defaultMakeId) {
      setValue('makeId', defaultMakeId);
    }
  }, [editingModel, defaultMakeId, setValue]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSave = (data: { name: string; makeId: string }) => {
    onSave(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editingModel ? 'Editar Modelo' : 'Novo Modelo'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(handleSave)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="makeId">Marca</Label>
            <Combobox
              options={makes.map(make => ({ label: make.name, value: make.id }))}
              {...register('makeId', { required: 'Marca é obrigatória' })}
              value={watch('makeId')}
              onSelect={(value) => setValue('makeId', value)}
              placeholder="Selecione a marca"
            />
            {errors.makeId && (
              <p className="text-sm text-red-500">{errors.makeId.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Modelo</Label>
            <Input
              id="name"
              placeholder="Ex: Fiesta, Onix, etc."
              {...register('name', { 
                required: 'Nome do modelo é obrigatório',
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

export default ModelForm;
