
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useForm } from 'react-hook-form';
import { Vehicle, Movement, VehicleMovementFormData } from '@/types';
import { useUnits } from '@/hooks/useUnits';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, X } from 'lucide-react';
import { movementService } from '@/services/movements/movementService';
import { cn } from '@/lib/utils';

interface VehicleMovementFormProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle;
  onSubmit: (data: Movement) => Promise<void>;
}

const VehicleMovementForm: React.FC<VehicleMovementFormProps> = ({
  isOpen,
  onClose,
  vehicle,
  onSubmit
}) => {
  // Obtém as unidades
  const { units } = useUnits();

  // Estado do tipo de movimentação (entrada/saída)
  const [movementType, setMovementType] = useState<'entry' | 'exit'>(
    vehicle.location === 'yard' ? 'exit' : 'entry'
  );

  // Estados para controle de inputs numéricos
  const [initialMileageInput, setInitialMileageInput] = useState(String(vehicle.mileage || 0));
  const [finalMileageInput, setFinalMileageInput] = useState('');
  
  // Estado para armazenar a movimentação ativa atual (se for uma entrada)
  const [activeMovement, setActiveMovement] = useState<Movement | null>(null);

  // Configuração do esquema de validação de acordo com o tipo de movimento
  const movementSchema = z.object({
    type: z.string().min(1, 'Tipo de movimentação é obrigatório'),
    status: z.string().min(1, 'Status é obrigatório'),
    driver: z.string().min(3, 'Nome do motorista deve ter pelo menos 3 caracteres'),
    vehicleId: z.string().min(1, 'ID do veículo é obrigatório'),
    departureUnitId: z.string().optional(),
    arrivalUnitId: z.string().optional(),
    departureDate: z.string().optional(),
    departureTime: z.string().optional(),
    arrivalDate: z.string().optional(),
    arrivalTime: z.string().optional(),
    initialMileage: z.number().min(0, 'Quilometragem inicial deve ser maior que zero'),
    finalMileage: z.number().optional(),
    destination: movementType === 'exit' ? 
      z.string().min(1, 'Destino é obrigatório') : 
      z.string().optional(),
  });

  // Hook form com validação
  const form = useForm<VehicleMovementFormData>({
    resolver: zodResolver(movementSchema),
    defaultValues: {
      type: movementType,
      status: movementType === 'exit' ? 'out' : 'yard',
      driver: '',
      vehicleId: vehicle.id,
      departureUnitId: vehicle.unitId || '',
      arrivalUnitId: vehicle.unitId || '',
      initialMileage: vehicle.mileage || 0,
      destination: ''
    },
    mode: 'onChange',
  });
  
  const { register, handleSubmit, formState: { errors, isSubmitting }, setValue, watch } = form;
  
  // Assistir os campos para revalidar
  const watchedInitialMileage = watch('initialMileage');

  // Gerenciador de mudança para quilometragem inicial
  const handleInitialMileageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInitialMileageInput(value);
    
    // Converter para número
    const numericValue = value === '' ? 0 : parseInt(value.replace(/\D/g, ''), 10);
    setValue('initialMileage', numericValue);
  };

  // Gerenciador de mudança para quilometragem final
  const handleFinalMileageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFinalMileageInput(value);
    
    // Converter para número
    const numericValue = value === '' ? 0 : parseInt(value.replace(/\D/g, ''), 10);
    setValue('finalMileage', numericValue);
  };

  // Função para buscar a movimentação ativa atual (se for uma entrada)
  const fetchActiveMovement = async () => {
    if (movementType === 'entry' && vehicle.location === 'out') {
      try {
        // Buscar movimentações do veículo
        const movements = await movementService.getMovementsByVehicle(vehicle.id);
        
        // Encontrar a movimentação ativa mais recente
        const activeMovement = movements
          .filter(m => m.status === 'out' && m.type === 'exit')
          .sort((a, b) => {
            const dateA = new Date(`${a.departureDate}T${a.departureTime}`);
            const dateB = new Date(`${b.departureDate}T${b.departureTime}`);
            return dateB.getTime() - dateA.getTime();
          })[0];
          
        if (activeMovement) {
          setActiveMovement(activeMovement);
          
          // Preencher o form com os dados da movimentação ativa
          setValue('driver', activeMovement.driver);
          setValue('departureUnitId', activeMovement.departureUnitId || '');
          setValue('initialMileage', activeMovement.initialMileage || vehicle.mileage || 0);
          setValue('destination', activeMovement.destination || '');
          setInitialMileageInput(String(activeMovement.initialMileage || vehicle.mileage || 0));
        }
      } catch (error) {
        console.error("Erro ao buscar movimentação ativa:", error);
      }
    }
  };
  
  // Carregar movimentação ativa ao abrir o form
  useEffect(() => {
    if (isOpen && vehicle.location === 'out' && movementType === 'entry') {
      fetchActiveMovement();
    }
  }, [isOpen, vehicle.location, movementType]);

  // Alterar o tipo de movimentação
  useEffect(() => {
    if (vehicle) {
      const newType = vehicle.location === 'yard' ? 'exit' : 'entry';
      setMovementType(newType);
      setValue('type', newType);
      setValue('status', newType === 'exit' ? 'out' : 'yard');

      // Reset fields
      if (newType === 'exit') {
        setValue('initialMileage', vehicle.mileage || 0);
        setInitialMileageInput(String(vehicle.mileage || 0));
        setValue('destination', '');
      } else {
        // Se for entrada, será preenchido pelo fetchActiveMovement
      }
    }
  }, [vehicle, setValue]);

  // Função para formatar a data atual
  const formatToday = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Função para formatar a hora atual
  const formatTime = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  // Handler para submissão do formulário
  const onFormSubmit = async (data: VehicleMovementFormData) => {
    try {
      // Preparar objeto de movimentação para envio
      const movementData: Movement = {
        id: '',  // Será gerado pelo backend
        vehicleId: vehicle.id,
        driver: data.driver,
        destination: data.destination || '',
        initialMileage: data.initialMileage,
        departureUnitId: data.departureUnitId || vehicle.unitId || '',
        departureDate: movementType === 'exit' ? formatToday() : activeMovement?.departureDate || '',
        departureTime: movementType === 'exit' ? formatTime() : activeMovement?.departureTime || '',
        type: movementType,
        status: movementType === 'exit' ? 'out' : 'yard',
      };
      
      // Se for entrada, adicionar campos específicos
      if (movementType === 'entry') {
        movementData.arrivalUnitId = data.arrivalUnitId || vehicle.unitId;
        movementData.arrivalDate = formatToday();
        movementData.arrivalTime = formatTime();
        movementData.finalMileage = data.finalMileage;
        
        // Se tiver uma movimentação ativa, usar seu ID
        if (activeMovement) {
          movementData.id = activeMovement.id;
        }
      }

      // Enviar para o componente pai
      await onSubmit(movementData);
      onClose();
    } catch (error) {
      console.error("Erro ao submeter formulário:", error);
    }
  };

  // Preparar as opções de unidades para os selects
  const unitOptions = units.map(unit => ({
    value: unit.id,
    label: unit.name
  }));

  // Título do form baseado no tipo de movimentação
  const formTitle = movementType === 'exit' ? 'Registrar Saída' : 'Registrar Entrada';
  
  // Título do botão baseado no tipo de movimentação
  const buttonTitle = movementType === 'exit' ? 'Registrar Saída' : 'Registrar Entrada';

  // Data atual formatada para exibição
  const today = new Date();
  const formattedDate = `${today.toLocaleDateString('pt-BR')} às ${today.getHours().toString().padStart(2, '0')}:${today.getMinutes().toString().padStart(2, '0')}`;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={cn(
          "sm:max-w-[500px] p-0 overflow-hidden border-2",
          movementType === 'exit' ? "border-orange-500" : "border-emerald-500"
        )}
      >
        <DialogHeader className={cn(
          "p-6",
          movementType === 'exit' ? "text-orange-500" : "text-emerald-500"
        )}>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold">{formTitle}</DialogTitle>
            <Button variant="ghost" className="h-8 w-8 p-0" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Preencha os campos abaixo para registrar a {movementType === 'exit' ? 'saída' : 'entrada'} do veículo.
            <br/>
            {formattedDate}
          </p>
        </DialogHeader>
        
        <div className="px-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-5">
              {/* Detalhes do Veículo */}
              <div className="space-y-1">
                <h3 className="font-medium">Veículo</h3>
                <p className="text-base">{vehicle.plate} - {vehicle.make} {vehicle.model}</p>
              </div>
              
              {/* Motorista */}
              <div className="space-y-1">
                <FormField
                  control={form.control}
                  name="driver"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center">
                        Motorista
                        <span className="text-red-500 ml-0.5">*</span>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Nome do motorista"
                          className="bg-navy-800 border-navy-600 text-white" 
                          {...field} 
                        />
                      </FormControl>
                      {movementType === 'entry' && (
                        <p className="text-xs text-muted-foreground">
                          Este é o motorista que realizou a saída
                        </p>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Destino (apenas para saídas) */}
              {movementType === 'exit' && (
                <div className="space-y-1">
                  <FormField
                    control={form.control}
                    name="destination"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          Destino
                          <span className="text-red-500 ml-0.5">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Local de destino" 
                            className="bg-navy-800 border-navy-600 text-white"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Quilometragem */}
              <div className="space-y-4">
                {/* KM Inicial */}
                <div className="space-y-1">
                  <Label className="flex items-center">
                    Quilometragem inicial
                    {movementType === 'exit' && <span className="text-red-500 ml-0.5">*</span>}
                  </Label>
                  <Input
                    type="text" 
                    placeholder="0 km"
                    value={initialMileageInput}
                    onChange={handleInitialMileageChange}
                    disabled={movementType === 'entry'}
                    className="bg-navy-800 border-navy-600 text-white"
                    required={movementType === 'exit'}
                  />
                  {movementType === 'exit' && watchedInitialMileage < (vehicle.mileage || 0) && (
                    <p className="text-red-500 text-xs">
                      Quilometragem inicial não pode ser menor que a atual do veículo ({vehicle.mileage} km)
                    </p>
                  )}
                  {movementType === 'exit' && (
                    <p className="text-xs text-muted-foreground">
                      KM atual: {vehicle.mileage} km
                    </p>
                  )}
                </div>
                
                {/* KM Final (apenas para entrada) */}
                {movementType === 'entry' && (
                  <div className="space-y-1">
                    <Label className="flex items-center">
                      Quilometragem final
                      <span className="text-red-500 ml-0.5">*</span>
                    </Label>
                    <Input
                      type="text"
                      placeholder="0 km"
                      value={finalMileageInput}
                      onChange={handleFinalMileageChange}
                      required
                      className="bg-navy-800 border-navy-600 text-white"
                      {...register('finalMileage', { 
                        required: 'Quilometragem final é obrigatória',
                        min: {
                          value: activeMovement?.initialMileage || vehicle.mileage || 0,
                          message: `Deve ser maior ou igual a ${activeMovement?.initialMileage || vehicle.mileage} km`
                        }
                      })}
                    />
                    {errors.finalMileage && (
                      <p className="text-red-500 text-xs">{errors.finalMileage.message}</p>
                    )}
                  </div>
                )}
              </div>
            
              <DialogFooter className="pt-2 pb-6">
                <Button 
                  type="button" 
                  variant="outline"
                  className="border-gray-600 bg-transparent text-white hover:bg-gray-800 hover:text-white"
                  onClick={onClose}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className={cn(
                    "text-white",
                    movementType === 'exit' 
                      ? "bg-orange-500 hover:bg-orange-600" 
                      : "bg-emerald-500 hover:bg-emerald-600"
                  )}
                >
                  {buttonTitle}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VehicleMovementForm;
