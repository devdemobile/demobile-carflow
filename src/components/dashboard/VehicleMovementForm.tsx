
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Car, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useVehicles } from '@/hooks/useVehicles';
import { Vehicle, Movement } from '@/types';
import { formatMileage } from '@/lib/utils';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

interface VehicleMovementFormProps {
  isOpen?: boolean;
  onClose?: () => void;
  vehicle?: Vehicle;
  onSubmit?: (formData: Movement) => void;
  lastMovement?: Movement;
}

interface MovementFormData {
  driver: string;
  destination: string;
  initialMileage: number;
  notes?: string;
}

const VehicleMovementForm: React.FC<VehicleMovementFormProps> = ({
  isOpen,
  onClose,
  vehicle,
  onSubmit,
  lastMovement
}) => {
  const navigate = useNavigate();
  const { findVehicleByPlate } = useVehicles();
  const [plate, setPlate] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');
  
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<MovementFormData>();
  const [mileageInput, setMileageInput] = useState('');
  
  // Determinar se é entrada ou saída baseado na localização atual do veículo
  const isExit = vehicle?.location === 'yard';
  const movementType = isExit ? 'exit' : 'entry';
  const formTitle = isExit ? 'Registrar Saída' : 'Registrar Entrada';
  const buttonText = isExit ? 'Registrar Saída' : 'Registrar Entrada';
  
  // Obter a data e hora atual formatadas para exibição
  const currentDate = new Date().toLocaleDateString('pt-BR');
  const currentTime = new Date().toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
  
  // Set initial values when vehicle changes
  useEffect(() => {
    if (vehicle) {
      const today = new Date().toISOString().split('T')[0];
      const currentTime = new Date().toTimeString().split(' ')[0].substring(0, 5);
      
      setValue('driver', '');
      setValue('destination', '');
      setValue('initialMileage', vehicle.mileage || 0);
      setValue('notes', '');
      
      setMileageInput(formatMileage(vehicle.mileage || 0));
    }
  }, [vehicle, setValue]);

  const handlePlateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlate(e.target.value.toUpperCase());
    setError('');
  };

  const handleMileageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Remove todos os caracteres não numéricos
    const numericValue = value.replace(/\D/g, '');
    
    // Converte para número
    const mileage = numericValue ? parseInt(numericValue, 10) : 0;
    
    // Atualiza o valor no formulário
    setValue('initialMileage', mileage);
    
    // Atualiza o valor exibido com formatação
    setMileageInput(formatMileage(mileage));
  };

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!plate.trim()) return;

    setIsSearching(true);
    setError('');

    try {
      const vehicle = await findVehicleByPlate(plate.trim());
      if (vehicle) {
        navigate(`/movements/new?vehicleId=${vehicle.id}`);
      } else {
        setError('Veículo não encontrado. Verifique a placa informada.');
      }
    } catch (error) {
      console.error('Erro ao buscar veículo:', error);
      setError('Erro ao buscar veículo. Tente novamente.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleDialogFormSubmit = (data: MovementFormData) => {
    if (!vehicle || !onSubmit) return;
    
    // Pega a data e hora atuais
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toTimeString().split(' ')[0].substring(0, 5);
    
    // Create movement object from form data
    const movement: Movement = {
      id: Math.random().toString(),
      vehicleId: vehicle.id,
      plate: vehicle.plate,
      vehicleName: `${vehicle.make} ${vehicle.model}`,
      driver: data.driver,
      destination: data.destination,
      initialMileage: data.initialMileage,
      departureDate: today,
      departureTime: now,
      notes: data.notes,
      departureUnitId: vehicle.unitId || '',
      status: isExit ? 'out' : 'yard',
      type: isExit ? 'exit' : 'entry'
    };
    
    onSubmit(movement);
    toast.success(`Movimentação de ${isExit ? 'saída' : 'entrada'} registrada com sucesso!`);
  };

  // If this is being used as a dialog, render the dialog version
  if (isOpen !== undefined && onClose && vehicle) {
    const borderColorClass = isExit ? 'border-amber-500' : 'border-emerald-500';
    
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent className={`sm:max-w-[500px] ${borderColorClass} border-2`}>
          <DialogHeader>
            <DialogTitle className={isExit ? 'text-amber-600' : 'text-emerald-600'}>
              {formTitle}
            </DialogTitle>
            <DialogDescription>
              {isExit 
                ? 'Preencha os campos abaixo para registrar a saída do veículo.' 
                : 'Preencha os campos abaixo para registrar a entrada do veículo.'
              }
              <span className="block text-muted-foreground text-xs mt-1">
                {currentDate} às {currentTime}
              </span>
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit(handleDialogFormSubmit)} className="space-y-4 py-2">
            <div className="grid gap-3">
              <div className="flex items-center space-x-2">
                <div className="w-full">
                  <Label htmlFor="vehicle-info">Veículo</Label>
                  <p id="vehicle-info" className="text-sm font-medium">
                    {vehicle.plate} - {vehicle.make} {vehicle.model}
                  </p>
                </div>
              </div>
              
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
                  <Label htmlFor="initialMileage" className="text-sm">Quilometragem atual*</Label>
                  <Input
                    id="initialMileage"
                    placeholder="0 km"
                    value={mileageInput}
                    onChange={handleMileageChange}
                  />
                  {errors.initialMileage && <p className="text-xs text-destructive mt-1">{errors.initialMileage.message}</p>}
                </div>
              </div>
            </div>
            
            <DialogFooter className="pt-2">
              <Button variant="outline" onClick={onClose} type="button">Cancelar</Button>
              <Button 
                type="submit" 
                className={isExit ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'}
              >
                {buttonText}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

  // Otherwise render the search form
  return (
    <form onSubmit={handleSearchSubmit} className="space-y-4">
      <div className="grid gap-2">
        <label htmlFor="plate-search" className="text-sm font-medium leading-none">
          {vehicle?.location === 'yard' ? 'Registrar Saída' : 'Registrar Entrada'}
          <span className="text-xs text-muted-foreground ml-2">
            {currentDate} às {currentTime}
          </span>
        </label>
        <div className="relative">
          <Input
            id="plate-search"
            placeholder="BRA2E25"
            value={plate}
            onChange={handlePlateChange}
            className="pl-9 uppercase"
          />
          <Car className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <p className="text-xs text-muted-foreground mt-1">Digite a placa do veículo</p>
        </div>
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button 
        type="submit" 
        disabled={isSearching || !plate.trim()}
        className={vehicle?.location === 'yard' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-emerald-600 hover:bg-emerald-700'}
      >
        {isSearching ? (
          <>
            <Search className="mr-2 h-4 w-4 animate-spin" />
            Buscando...
          </>
        ) : (
          vehicle?.location === 'yard' ? 'Registrar Saída' : 'Registrar Entrada'
        )}
      </Button>
    </form>
  );
};

export default VehicleMovementForm;
