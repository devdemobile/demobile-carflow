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
import { Camera, X, Upload, Plus } from 'lucide-react';
import { Combobox, ComboboxOption } from '@/components/ui/combobox';
import { toast } from 'sonner';
import CameraModal from './CameraModal';
import { useUnits } from '@/hooks/useUnits';
import { vehicleService } from '@/services/vehicles/vehicleService';
import { useVehicleMakes } from '@/hooks/useVehicleMakes';
import { useVehicleModels } from '@/hooks/useVehicleModels';
import { formatMileage } from '@/lib/utils';
import MakeForm from './makes/MakeForm';
import ModelForm from './models/ModelForm';

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
  const [mileageInput, setMileageInput] = useState('');
  const [isAddMakeOpen, setIsAddMakeOpen] = useState(false);
  const [isAddModelOpen, setIsAddModelOpen] = useState(false);
  const [makeSearchTerm, setMakeSearchTerm] = useState('');
  const [modelSearchTerm, setModelSearchTerm] = useState('');
  const [filteredMakes, setFilteredMakes] = useState<ComboboxOption[]>([]);
  const [filteredModels, setFilteredModels] = useState<ComboboxOption[]>([]);
  
  const { units } = useUnits();
  const { makes, createMake, isCreating: isCreatingMake, findMakesByText } = useVehicleMakes();
  
  const watchMakeId = watch('makeId');
  const { models, createModel, isCreating: isCreatingModel, findModelsByText } = useVehicleModels(watchMakeId);
  
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
      setValue('makeId', editingVehicle.makeId);
      setValue('modelId', editingVehicle.modelId);
      
      setMileageInput(formatMileage(editingVehicle.mileage));
      
      if (editingVehicle.photoUrl) {
        setPhoto(editingVehicle.photoUrl);
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
        makeId: '',
        modelId: ''
      });
      setPhoto(null);
      setMileageInput('');
    }
  }, [editingVehicle, reset, setValue, units]);
  
  // Atualiza make e model quando o usuário seleciona makeId e modelId
  useEffect(() => {
    if (watchMakeId) {
      const selectedMake = makes.find(make => make.id === watchMakeId);
      if (selectedMake) {
        setValue('make', selectedMake.name);
      }
    }
  }, [watchMakeId, makes, setValue]);
  
  const watchModelId = watch('modelId');
  
  useEffect(() => {
    if (watchModelId) {
      const selectedModel = models.find(model => model.id === watchModelId);
      if (selectedModel) {
        setValue('model', selectedModel.name);
      }
    }
  }, [watchModelId, models, setValue]);

  // Inicializa as opções de marca e modelo
  useEffect(() => {
    setFilteredMakes(makes.map(make => ({ label: make.name, value: make.id })));
  }, [makes]);
  
  useEffect(() => {
    setFilteredModels(models.map(model => ({ label: model.name, value: model.id })));
  }, [models]);

  const handleCapturePhoto = (photoDataUrl: string) => {
    setPhoto(photoDataUrl);
    setIsCameraOpen(false);
  };

  const handleOpenCamera = () => {
    setIsCameraOpen(true);
  };
  
  // Função para lidar com o upload de fotos
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
  
  // Funções para formatar a quilometragem
  const handleMileageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Remove todos os caracteres não numéricos
    const numericValue = value.replace(/\D/g, '');
    
    // Converte para número
    const mileage = numericValue ? parseInt(numericValue, 10) : 0;
    
    // Atualiza o valor no formulário
    setValue('mileage', mileage);
    
    // Atualiza o valor exibido com formatação
    setMileageInput(formatMileage(mileage));
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

  const handleCreateMake = (name: string) => {
    createMake(name, {
      onSuccess: (newMake) => {
        if (newMake) {
          setValue('makeId', newMake.id);
          setValue('make', newMake.name);
          toast.success(`Marca "${newMake.name}" criada com sucesso!`);
          setIsAddMakeOpen(false);
        }
      }
    });
  };

  const handleCreateModel = (data: { name: string; makeId: string }) => {
    if (!data.makeId && watchMakeId) {
      data.makeId = watchMakeId;
    }
    
    if (!data.makeId) {
      toast.error('Selecione uma marca antes de adicionar um modelo.');
      return;
    }
    
    createModel(data, {
      onSuccess: (newModel) => {
        if (newModel) {
          setValue('modelId', newModel.id);
          setValue('model', newModel.name);
          toast.success(`Modelo "${newModel.name}" criado com sucesso!`);
          setIsAddModelOpen(false);
        }
      }
    });
  };

  const handleMakeSearch = (value: string) => {
    setMakeSearchTerm(value);
    
    if (value.trim() === '') {
      setFilteredMakes(makes.map(make => ({ label: make.name, value: make.id })));
      return;
    }
    
    const foundMakes = findMakesByText(value);
    setFilteredMakes(foundMakes.map(make => ({ label: make.name, value: make.id })));
  };

  const handleModelSearch = (value: string) => {
    setModelSearchTerm(value);
    
    if (value.trim() === '') {
      setFilteredModels(models.map(model => ({ label: model.name, value: model.id })));
      return;
    }
    
    const foundModels = findModelsByText(value);
    setFilteredModels(foundModels.map(model => ({ label: model.name, value: model.id })));
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
                  value={mileageInput}
                  onChange={handleMileageChange}
                  placeholder="0 km"
                />
                <input type="hidden" {...register('mileage', { 
                  required: 'Quilometragem é obrigatória',
                  valueAsNumber: true,
                  min: {
                    value: 0,
                    message: 'Quilometragem não pode ser negativa'
                  }
                })} />
                {errors.mileage && <p className="text-sm text-red-500">{errors.mileage.message}</p>}
              </div>
              
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="makeId">Marca*</Label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Combobox
                      id="makeId"
                      options={filteredMakes}
                      {...register('makeId', { required: 'Marca é obrigatória' })}
                      value={watch('makeId') || ''}
                      onSelect={(value) => setValue('makeId', value)}
                      placeholder="Selecione a marca"
                      onInputChange={handleMakeSearch}
                      allowCustomValue={false}
                    />
                  </div>
                  {makeSearchTerm && !filteredMakes.some(make => make.label.toLowerCase() === makeSearchTerm.toLowerCase()) && (
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      onClick={() => setIsAddMakeOpen(true)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <input type="hidden" {...register('make', { required: true })} />
                {errors.makeId && <p className="text-sm text-red-500">{errors.makeId.message}</p>}
              </div>
              
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="modelId">Modelo*</Label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Combobox
                      id="modelId"
                      options={filteredModels}
                      {...register('modelId', { required: 'Modelo é obrigatório' })}
                      value={watch('modelId') || ''}
                      onSelect={(value) => setValue('modelId', value)}
                      placeholder={watchMakeId ? "Selecione o modelo" : "Selecione uma marca primeiro"}
                      disabled={!watchMakeId}
                      onInputChange={handleModelSearch}
                      allowCustomValue={false}
                    />
                  </div>
                  {watchMakeId && modelSearchTerm && !filteredModels.some(model => model.label.toLowerCase() === modelSearchTerm.toLowerCase()) && (
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      onClick={() => setIsAddModelOpen(true)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <input type="hidden" {...register('model', { required: true })} />
                {errors.modelId && <p className="text-sm text-red-500">{errors.modelId.message}</p>}
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
      
      {/* Modal para adicionar uma nova marca */}
      <MakeForm
        isOpen={isAddMakeOpen}
        onClose={() => setIsAddMakeOpen(false)}
        onSave={handleCreateMake}
        isLoading={isCreatingMake}
        initialValue={makeSearchTerm}
      />
      
      {/* Modal para adicionar um novo modelo */}
      <ModelForm
        isOpen={isAddModelOpen}
        onClose={() => setIsAddModelOpen(false)}
        onSave={handleCreateModel}
        isLoading={isCreatingModel}
        defaultMakeId={watchMakeId}
        initialValue={modelSearchTerm}
      />
    </>
  );
};

export default VehicleForm;
