import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Vehicle, Movement } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { movementService } from '@/services/movements/movementService';

interface VehicleMovementFormProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle;
  onSubmit: (formData: any) => void;
  lastMovement?: Movement;
}

const VehicleMovementForm: React.FC<VehicleMovementFormProps> = ({
  isOpen,
  onClose,
  vehicle,
  onSubmit,
  lastMovement,
}) => {
  const [driver, setDriver] = useState('');
  const [initialMileage, setInitialMileage] = useState(0);
  const [finalMileage, setFinalMileage] = useState(0);
  const [destination, setDestination] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Set form values based on vehicle status
  useEffect(() => {
    if (vehicle) {
      if (vehicle.location === 'yard') {
        // Vehicle is in yard, preparing for exit
        setInitialMileage(vehicle.mileage);
        setFinalMileage(0);
        setDriver('');
        setDestination('');
      } else if (vehicle.location === 'out' && lastMovement) {
        // Vehicle is out, preparing for entry
        setInitialMileage(lastMovement.initialMileage);
        setFinalMileage(vehicle.mileage);
        setDriver(lastMovement.driver);
        setDestination(lastMovement.destination || '');
      }
    }
  }, [vehicle, lastMovement]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!driver.trim()) {
      newErrors.driver = 'Motorista é obrigatório';
    }
    
    if (vehicle.location === 'out' && finalMileage <= initialMileage) {
      newErrors.finalMileage = 'Quilometragem final deve ser maior que a inicial';
    }
    
    if (vehicle.location === 'yard' && !destination.trim()) {
      newErrors.destination = 'Destino é obrigatório para saída';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !user) return;
    setIsSubmitting(true);
    
    try {
      if (vehicle.location === 'yard') {
        // Exiting the yard - Create a new movement
        const movementData = {
          vehicleId: vehicle.id,
          driver,
          destination,
          initialMileage,
          departureUnitId: user.unitId || '',
          type: 'exit' as const
        };
        
        const result = await movementService.createMovement(movementData, user.id);
        
        if (result) {
          toast({
            title: 'Saída registrada',
            description: `Veículo ${vehicle.plate} saiu com sucesso.`,
          });
          
          // Notificar o componente pai
          onSubmit(result);
          onClose();
        }
      } else {
        // Entering the yard - Finalize an existing movement
        if (lastMovement && user.unitId) {
          const result = await movementService.finalizeMovement(
            lastMovement.id, 
            {
              finalMileage,
              arrivalDate: new Date().toISOString().split('T')[0],
              arrivalTime: new Date().toTimeString().substring(0, 8),
              arrivalUnitId: user.unitId
            }
          );
          
          if (result) {
            toast({
              title: 'Entrada registrada',
              description: `Veículo ${vehicle.plate} entrou com sucesso.`,
            });
            
            // Notificar o componente pai
            onSubmit(result);
            onClose();
          }
        } else {
          throw new Error("Dados insuficientes para finalizar movimentação");
        }
      }
    } catch (error) {
      console.error("Erro ao registrar movimentação:", error);
      toast({
        title: 'Erro ao registrar movimentação',
        description: error instanceof Error ? error.message : 'Ocorreu um erro ao processar sua solicitação.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {vehicle.location === 'yard' 
              ? 'Registrar Saída de Veículo' 
              : 'Registrar Entrada de Veículo'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="space-y-4">
            <div>
              <div className="font-medium mb-1">Veículo</div>
              <div className="text-sm bg-muted p-2 rounded">
                {vehicle.plate} - {vehicle.make} {vehicle.model} {vehicle.color} {vehicle.year}
              </div>
            </div>
            
            {vehicle.location === 'out' && lastMovement && (
              <div>
                <div className="font-medium mb-1">Dados da Saída</div>
                <div className="text-sm bg-muted p-2 rounded">
                  <p>Unidade: {lastMovement.departureUnitId === '1' ? 'Matriz' : 'Filial 6'}</p>
                  <p>Data: {lastMovement.departureDate.split('-').reverse().join('/')} às {lastMovement.departureTime}</p>
                  <p>Destino: {lastMovement.destination || 'Não informado'}</p>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="driver">Motorista</Label>
              <Input
                id="driver"
                value={driver}
                onChange={e => setDriver(e.target.value)}
                placeholder="Nome do motorista"
              />
              {errors.driver && <p className="text-destructive text-xs">{errors.driver}</p>}
            </div>
            
            <div className="flex gap-4">
              <div className="space-y-2 flex-1">
                <Label htmlFor="initialMileage">KM Inicial</Label>
                <Input
                  id="initialMileage"
                  type="number"
                  value={initialMileage}
                  onChange={e => setInitialMileage(parseInt(e.target.value))}
                  disabled={vehicle.location === 'out'}
                />
              </div>
              
              {vehicle.location === 'out' && (
                <div className="space-y-2 flex-1">
                  <Label htmlFor="finalMileage">KM Final</Label>
                  <Input
                    id="finalMileage"
                    type="number"
                    value={finalMileage}
                    onChange={e => setFinalMileage(parseInt(e.target.value))}
                  />
                  {errors.finalMileage && <p className="text-destructive text-xs">{errors.finalMileage}</p>}
                </div>
              )}
            </div>
            
            {vehicle.location === 'yard' && (
              <div className="space-y-2">
                <Label htmlFor="destination">Destino</Label>
                <Input
                  id="destination"
                  value={destination}
                  onChange={e => setDestination(e.target.value)}
                  placeholder="Para onde o veículo está indo?"
                />
                {errors.destination && <p className="text-destructive text-xs">{errors.destination}</p>}
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Cancelar</Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processando...
              </span>
            ) : (
              vehicle.location === 'yard' ? 'Registrar Saída' : 'Registrar Entrada'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VehicleMovementForm;
