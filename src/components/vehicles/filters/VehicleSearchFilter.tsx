
import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface VehicleSearchFilterProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  placeholder?: string;
}

const VehicleSearchFilter: React.FC<VehicleSearchFilterProps> = ({
  searchValue,
  onSearchChange,
  placeholder = "Buscar por placa, marca, modelo, cor..."
}) => {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
      <Input
        placeholder={placeholder}
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10"
      />
    </div>
  );
};

export default VehicleSearchFilter;
