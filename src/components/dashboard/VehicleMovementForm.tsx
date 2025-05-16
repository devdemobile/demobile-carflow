import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Vehicle, Movement } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

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

  const handleSubmit = () => {
    if (!validateForm()) return;
    
    const formData = {
      vehicleId: vehicle.id,
      plate: vehicle.plate,
      vehicleName: `${vehicle.make} ${vehicle.model} ${vehicle.color} ${vehicle.year}`,
      driver,
      initialMileage,
      unitId: user?.unitId,
      unitName: user?.unitName,
    };
    
    if (vehicle.location === 'yard') {
      // Exiting the yard
      Object.assign(formData, {
        destination,
        type: 'exit',
        status: 'out',
      });
    } else {
      // Entering the yard
      Object.assign(formData, {
        finalMileage,
        mileageRun: finalMileage - initialMileage,
        type: 'entry',
        status: 'yard',
        departureUnitId: lastMovement?.departureUnitId,
        departureDate: lastMovement?.departureDate,
        departureTime: lastMovement?.departureTime,
      });
    }
    
    onSubmit(formData);
    toast({
      title: vehicle.location === 'yard' ? 'Saída registrada' : 'Entrada registrada',
      description: `Veículo ${vehicle.plate} ${vehicle.location === 'yard' ? 'saiu' : 'entrou'} com sucesso.`,
    });
    
    onClose();
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
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSubmit}>
            {vehicle.location === 'yard' ? 'Registrar Saída' : 'Registrar Entrada'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default VehicleMovementForm;
