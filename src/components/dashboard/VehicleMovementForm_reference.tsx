
import React, { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Car, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useVehicles } from '@/hooks/useVehicles';
import { Vehicle } from '@/types';

const VehicleMovementForm: React.FC = () => {
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
