
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
import { Combobox } from '@/components/ui/combobox';
import { useVehicleMakes } from '@/hooks/useVehicleMakes';
import { useEffect } from 'react';

interface ModelFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { name: string; makeId: string }) => void;
  isLoading: boolean;
  editingModel?: VehicleModel | null;
  defaultMakeId?: string;
  initialValue?: string;
}

const ModelForm: React.FC<ModelFormProps> = ({
  isOpen,
  onClose,
  onSave,
  isLoading,
  editingModel,
  defaultMakeId,
  initialValue
}) => {
  const { makes } = useVehicleMakes();
  
  const { register, handleSubmit, formState: { errors }, reset, setValue, watch } = 
    useForm<{ name: string; makeId: string }>({
      defaultValues: {
        name: editingModel?.name || initialValue || '',
        makeId: editingModel?.makeId || defaultMakeId || ''
      }
    });

  // Atualizar formulário quando os valores iniciais mudam
  useEffect(() => {
    if (isOpen) {
      if (editingModel) {
        setValue('name', editingModel.name);
        setValue('makeId', editingModel.makeId);
      } else {
        if (initialValue) {
          setValue('name', initialValue);
        }
        if (defaultMakeId) {
          setValue('makeId', defaultMakeId);
        }
      }
    }
  }, [isOpen, editingModel, defaultMakeId, initialValue, setValue]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSaveModel = (data: { name: string; makeId: string }) => {
    onSave(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{editingModel ? 'Editar Modelo' : 'Novo Modelo'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(handleSaveModel)} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="makeId">Marca</Label>
            <Combobox
              id="makeId"
              options={makes.map(make => ({ label: make.name, value: make.id }))}
              value={watch('makeId')}
              onSelect={(value) => setValue('makeId', value)}
              placeholder="Selecione a marca"
            />
            <input 
              type="hidden" 
              {...register('makeId', { required: 'Marca é obrigatória' })} 
            />
            {errors.makeId && (
              <p className="text-sm text-red-500">{errors.makeId.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="name">Nome do Modelo</Label>
            <Input
              id="name"
              placeholder="Ex: Gol, Corolla, etc."
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
