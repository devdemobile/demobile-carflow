
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface VehicleMovementFormCustomProps {
  onSearch: (plate: string) => void;
  isLoading?: boolean;
}

const VehicleMovementFormCustom: React.FC<VehicleMovementFormCustomProps> = ({ 
  onSearch, 
  isLoading = false 
}) => {
  const [plate, setPlate] = useState<string>('');
  const isMobile = useIsMobile();

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (plate.trim()) {
      onSearch(plate.trim().toUpperCase());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex w-full items-center gap-2">
      <div className="flex-1 relative">
        <Input 
          type="text" 
          placeholder="Digite a placa do veículo" 
          value={plate} 
          onChange={(e) => setPlate(e.target.value.toUpperCase())} 
          className="pr-10" 
          disabled={isLoading}
          autoFocus
        />
      </div>
      
      <Button 
        type="submit" 
        size={isMobile ? "icon" : "default"} 
        disabled={!plate.trim() || isLoading} 
        className={isMobile ? "w-10 h-10 p-0" : ""}
      >
        <Search className="h-4 w-4" />
        {!isMobile && <span className="ml-2">Registrar</span>}
      </Button>
    </form>
  );
};

export default VehicleMovementFormCustom;
