
import React, { useState, useEffect } from 'react';
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
import { Vehicle, VehicleDTO } from '@/types';
import { Camera, X, Upload } from 'lucide-react';
import { Combobox } from '@/components/ui/combobox';
import { toast } from 'sonner';
import CameraModal from './CameraModal';
import { useUnits } from '@/hooks/useUnits';
import { vehicleService } from '@/services/vehicles/vehicleService';

// Lista de marcas comuns de veículos
const commonMakes = [
  'Chevrolet', 'Volkswagen', 'Fiat', 'Ford', 'Honda', 'Toyota', 
  'Hyundai', 'Renault', 'Nissan', 'Mitsubishi', 'Kia', 'BMW',
  'Mercedes-Benz', 'Audi', 'Jeep', 'Citroën', 'Peugeot'
];

// Lista de modelos comuns por marca
const commonModelsByMake: Record<string, string[]> = {
  'Chevrolet': ['Onix', 'Prisma', 'Cruze', 'S10', 'Tracker', 'Spin', 'Equinox'],
  'Volkswagen': ['Gol', 'Polo', 'Virtus', 'T-Cross', 'Amarok', 'Jetta', 'Tiguan'],
  'Fiat': ['Uno', 'Argo', 'Cronos', 'Toro', 'Strada', 'Mobi', 'Fiorino'],
  'Ford': ['Ka', 'EcoSport', 'Ranger', 'Fiesta', 'Focus', 'Territory', 'Bronco'],
  'Honda': ['Civic', 'HR-V', 'Fit', 'City', 'WR-V', 'CR-V'],
  'Toyota': ['Corolla', 'Hilux', 'Yaris', 'SW4', 'RAV4', 'Etios'],
  'Hyundai': ['HB20', 'Creta', 'Tucson', 'i30', 'Santa Fe'],
  'Renault': ['Kwid', 'Sandero', 'Logan', 'Duster', 'Captur', 'Oroch'],
  'Nissan': ['March', 'Versa', 'Kicks', 'Frontier', 'Sentra'],
  'Mitsubishi': ['L200', 'Pajero', 'Eclipse Cross', 'ASX', 'Outlander'],
  'Kia': ['Sportage', 'Cerato', 'Sorento', 'Soul', 'Picanto'],
};

interface VehicleFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  editingVehicle?: Vehicle | null;
}

const VehicleForm: React.FC<VehicleFormProps> = ({
  isOpen,
  onClose,
  onSave,
  editingVehicle
}) => {
  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<VehicleDTO>();
  const [isSaving, setIsSaving] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const [currentModels, setCurrentModels] = useState<string[]>([]);
  
  const { units } = useUnits();
  const watchMake = watch('make');

  // Carrega os modelos com base na marca selecionada
  useEffect(() => {
    if (watchMake) {
      const models = commonModelsByMake[watchMake] || [];
      setCurrentModels(models);
    } else {
      setCurrentModels([]);
    }
  }, [watchMake]);
  
  // Carrega os dados do veículo quando estiver editando
  useEffect(() => {
    if (editingVehicle) {
      setValue('plate', editingVehicle.plate);
      setValue('make', editingVehicle.make);
      setValue('model', editingVehicle.model);
      setValue('color', editingVehicle.color);
      setValue('year', editingVehicle.year);
      setValue('mileage', editingVehicle.mileage);
      setValue('unitId', editingVehicle.unitId);
      
      if (editingVehicle.photoUrl) {
        setPhoto(editingVehicle.photoUrl);
      }

      // Atualiza os modelos para a marca do veículo
      if (editingVehicle.make && commonModelsByMake[editingVehicle.make]) {
        setCurrentModels(commonModelsByMake[editingVehicle.make]);
      }
    } else {
      reset({
        plate: '',
        make: '',
        model: '',
        color: '',
        year: new Date().getFullYear(),
        mileage: 0,
        unitId: units.length > 0 ? units[0].id : '',
      });
      setPhoto(null);
    }
  }, [editingVehicle, reset, setValue, units]);

  const handleCapturePhoto = (photoDataUrl: string) => {
    setPhoto(photoDataUrl);
    setIsCameraOpen(false);
  };

  const handleOpenCamera = () => {
    setIsCameraOpen(true);
  };
  
  // Nova função para lidar com o upload de fotos
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Verificar o tipo do arquivo
      if (!file.type.match('image.*')) {
        toast.error('Por favor, selecione apenas arquivos de imagem.');
        return;
      }
      
      // Verificar o tamanho do arquivo (limitar a 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('A imagem deve ter no máximo 5MB.');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        if (typeof event.target?.result === 'string') {
          setPhoto(event.target.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (data: VehicleDTO) => {
    try {
      setIsSaving(true);
      data.photoUrl = photo;
      
      if (editingVehicle) {
        await vehicleService.updateVehicle(editingVehicle.id, data);
        toast.success('Veículo atualizado com sucesso!');
      } else {
        await vehicleService.createVehicle(data);
        toast.success('Veículo cadastrado com sucesso!');
      }
      
      onSave();
      onClose();
    } catch (error: any) {
      toast.error(`Erro ao salvar veículo: ${error.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingVehicle ? 'Editar Veículo' : 'Cadastrar Veículo'}</DialogTitle>
          </DialogHeader>
          
          <form onSubmit={handleSubmit(handleSave)} className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="plate">Placa*</Label>
                <Input 
                  id="plate"
                  placeholder="ABC1234"
                  {...register('plate', { required: 'Placa é obrigatória' })}
                />
                {errors.plate && <p className="text-sm text-red-500">{errors.plate.message}</p>}
              </div>
              
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="mileage">Quilometragem Atual*</Label>
                <Input 
                  id="mileage"
                  type="number"
                  placeholder="0"
                  {...register('mileage', { 
                    required: 'Quilometragem é obrigatória',
                    valueAsNumber: true,
                    min: {
                      value: 0,
                      message: 'Quilometragem não pode ser negativa'
                    }
                  })}
                />
                {errors.mileage && <p className="text-sm text-red-500">{errors.mileage.message}</p>}
              </div>
              
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="make">Marca*</Label>
                <Combobox
                  options={commonMakes.map(make => ({ label: make, value: make }))}
                  {...register('make', { required: 'Marca é obrigatória' })}
                  value={watch('make') || ''}
                  onSelect={(value) => setValue('make', value)}
                  placeholder="Selecione ou digite a marca"
                  allowCustomValue
                />
                {errors.make && <p className="text-sm text-red-500">{errors.make.message}</p>}
              </div>
              
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="model">Modelo*</Label>
                <Combobox
                  options={currentModels.map(model => ({ label: model, value: model }))}
                  {...register('model', { required: 'Modelo é obrigatório' })}
                  value={watch('model') || ''}
                  onSelect={(value) => setValue('model', value)}
                  placeholder="Selecione ou digite o modelo"
                  allowCustomValue
                />
                {errors.model && <p className="text-sm text-red-500">{errors.model.message}</p>}
              </div>
              
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="color">Cor*</Label>
                <Input 
                  id="color"
                  placeholder="Branco"
                  {...register('color', { required: 'Cor é obrigatória' })}
                />
                {errors.color && <p className="text-sm text-red-500">{errors.color.message}</p>}
              </div>
              
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="year">Ano*</Label>
                <Input 
                  id="year"
                  type="number"
                  placeholder={new Date().getFullYear().toString()}
                  {...register('year', { 
                    required: 'Ano é obrigatório',
                    valueAsNumber: true,
                    min: {
                      value: 1900,
                      message: 'Ano inválido'
                    },
                    max: {
                      value: new Date().getFullYear() + 1,
                      message: `Ano não pode ser maior que ${new Date().getFullYear() + 1}`
                    }
                  })}
                />
                {errors.year && <p className="text-sm text-red-500">{errors.year.message}</p>}
              </div>
              
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="unitId">Unidade*</Label>
                <select
                  id="unitId"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  {...register('unitId', { required: 'Unidade é obrigatória' })}
                >
                  {units.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.name} ({unit.code})
                    </option>
                  ))}
                </select>
                {errors.unitId && <p className="text-sm text-red-500">{errors.unitId.message}</p>}
              </div>

              <div className="flex flex-col space-y-1.5 col-span-1 md:col-span-2">
                <Label>Foto do Veículo</Label>
                <div className="flex flex-col items-center border-2 border-dashed border-gray-300 rounded-md p-4">
                  {photo ? (
                    <div className="relative w-full">
                      <img 
                        src={photo} 
                        alt="Foto do veículo" 
                        className="w-full h-40 object-cover rounded-md mx-auto"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => setPhoto(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row w-full gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full flex-1"
                        onClick={handleOpenCamera}
                      >
                        <Camera className="mr-2 h-4 w-4" /> Capturar Foto
                      </Button>
                      <div className="relative w-full flex-1">
                        <Input
                          type="file"
                          id="photoUpload"
                          accept="image/*"
                          className="absolute inset-0 opacity-0 cursor-pointer z-10"
                          onChange={handleFileUpload}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full"
                        >
                          <Upload className="mr-2 h-4 w-4" /> Anexar Foto
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isSaving}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? 'Salvando...' : 'Salvar'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <CameraModal 
        isOpen={isCameraOpen} 
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCapturePhoto}
      />
    </>
  );
};

export default VehicleForm;
