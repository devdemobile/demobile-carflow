import React, { useState } from 'react';
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
  DialogFooter
} from '@/components/ui/dialog';

interface VehicleMovementFormProps {
  isOpen?: boolean;
  onClose?: () => void;
  vehicle?: Vehicle;
  onSubmit?: (formData: Movement) => void;
  lastMovement?: Movement;
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

  const handlePlateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPlate(e.target.value.toUpperCase());
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
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

  // If this is being used as a dialog, render the dialog version
  if (isOpen !== undefined && onClose && vehicle) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar Movimentação</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Veículo: {vehicle.plate} - {vehicle.make} {vehicle.model}</p>
            {/* Add more form fields as needed for the dialog version */}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="button" onClick={() => {
              if (onSubmit) {
                // Create a mock movement object - replace with actual form data
                const mockMovement: Movement = {
                  id: Math.random().toString(),
                  vehicleId: vehicle.id,
                  plate: vehicle.plate,
                  driver: "Example Driver",
                  initialMileage: vehicle.mileage,
                  departureUnitId: "unit-id",
                  departureDate: new Date().toISOString().split('T')[0],
                  departureTime: new Date().toTimeString().split(' ')[0],
                  status: 'yard',
                  type: 'exit'
                };
                onSubmit(mockMovement);
                onClose();
              }
            }}>
              Registrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Otherwise render the search form
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-2">
        <label htmlFor="plate-search" className="text-sm font-medium leading-none">
          Registrar movimentação
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

      <Button type="submit" disabled={isSearching || !plate.trim()}>
        {isSearching ? (
          <>
            <Search className="mr-2 h-4 w-4 animate-spin" />
            Buscando...
          </>
        ) : (
          'Localizar veículo'
        )}
      </Button>
    </form>
  );
};

export default VehicleMovementForm;
